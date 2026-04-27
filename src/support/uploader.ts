import fs from 'node:fs'
import path from 'node:path'
import type { AstroIntegration } from 'astro'
import { Operator } from 'opendal'
import { Settings } from './../config.ts'

interface UploadPath {
    path: string
    recursive?: boolean
    keep?: boolean
    override?: boolean
}

interface UploadOptions {
    enable?: boolean
    paths: Array<string | UploadPath>
    recursive?: boolean
    keep?: boolean
    override?: boolean
    region?: string
    endpoint?: string
    bucket: string
    root?: string
    accessKey: string
    secretAccessKey: string
    extraOptions?: Record<string, string>
    manifestKey?: string
    concurrency?: number
}

type ResolvedUploadPath = Required<UploadPath>

interface AssetManifest {
    version: 1
    generatedAt: string
    files: Record<string, { size: number }>
}

interface UploadTask {
    key: string
    filePath: string
    size: number
}

interface Logger {
    info: (message: string) => void
    warn: (message: string) => void
    error: (message: string) => void
}

const NullAstroIntegration = { name: 'null', hooks: {} } as AstroIntegration
const DefaultManifestKey = 'assets/.upload-manifest.json'
const DefaultConcurrency = 8

export function uploadAssetsToS3(): AstroIntegration {
    if (!Settings.Assets.uploadAssetsToS3) {
        return NullAstroIntegration
    }

    return incrementalUploader(Settings.Assets.config)
}

function incrementalUploader(options: UploadOptions): AstroIntegration {
    return {
        name: 'S3 Incremental Uploader',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                const resolvedOptions = resolveOptions(options)

                if (!resolvedOptions.enable) {
                    logger.warn('Skip the S3 incremental uploader.')
                    return
                }

                logger.info('Try to verify the S3 credentials.')
                const operator = new Operator('s3', resolvedOptions.s3Options)
                await operator.check()

                const manifestKey = normalizePath(resolvedOptions.manifestKey)
                const manifest = await loadManifest(operator, logger, manifestKey, resolvedOptions.paths)
                const tasks = collectUploadTasks(dir.pathname, resolvedOptions.paths, manifest)

                if (tasks.length > 0) {
                    logger.info(`Found ${tasks.length} new static assets. Start incremental upload.`)
                    await runWithConcurrency(tasks, resolvedOptions.concurrency, async (task) => {
                        await uploadFile(operator, task)
                        manifest.files[task.key] = { size: task.size }
                        logger.info(`Uploaded ${task.key}`)
                    })
                }

                if (tasks.length === 0) {
                    logger.info('No new static assets found. Skip S3 upload.')
                }

                manifest.generatedAt = new Date().toISOString()
                await writeManifest(operator, manifestKey, manifest)
                removeUploadedDirectories(dir.pathname, resolvedOptions.paths, logger)
                logger.info(`S3 incremental upload finished. Manifest: ${manifestKey}`)
            },
        },
    }
}

function resolveOptions(options: UploadOptions) {
    const recursive = options.recursive ?? true
    const keep = options.keep ?? false
    const override = options.override ?? false
    const region = options.region ?? 'auto'
    const manifestKey = options.manifestKey ?? DefaultManifestKey
    const concurrency = Number.isFinite(options.concurrency) && options.concurrency !== undefined
        ? Math.max(1, Math.floor(options.concurrency))
        : DefaultConcurrency

    const s3Options: Record<string, string> = {
        ...(options.extraOptions ?? {}),
        root: options.root ?? '',
        bucket: options.bucket,
        region,
        access_key_id: options.accessKey,
        secret_access_key: options.secretAccessKey,
    }

    if (options.endpoint !== undefined) {
        s3Options.endpoint = options.endpoint
    }

    const paths = options.paths.map((current) => {
        if (typeof current === 'string') {
            return { path: current, recursive, keep, override }
        }

        return {
            path: current.path,
            recursive: current.recursive ?? recursive,
            keep: current.keep ?? keep,
            override: current.override ?? override,
        }
    })

    return {
        enable: options.enable ?? true,
        s3Options,
        paths,
        manifestKey,
        concurrency,
    }
}

async function loadManifest(
    operator: Operator,
    logger: Logger,
    manifestKey: string,
    uploadPaths: ResolvedUploadPath[],
): Promise<AssetManifest> {
    const content = await readRemoteFile(operator, manifestKey)

    if (content !== undefined) {
        const manifest = JSON.parse(content.toString()) as AssetManifest

        if (manifest.version === 1 && manifest.files !== undefined) {
            logger.info(`Loaded S3 upload manifest: ${manifestKey}`)
            return manifest
        }

        logger.warn(`Ignore invalid S3 upload manifest: ${manifestKey}`)
    }

    if (content === undefined) {
        logger.warn(`S3 upload manifest not found. Bootstrap it from remote assets: ${manifestKey}`)
    }

    return bootstrapManifestFromRemote(operator, logger, uploadPaths, manifestKey)
}

async function bootstrapManifestFromRemote(
    operator: Operator,
    logger: Logger,
    uploadPaths: ResolvedUploadPath[],
    manifestKey: string,
): Promise<AssetManifest> {
    const files: AssetManifest['files'] = {}

    for (const current of uploadPaths) {
        const remotePath = ensureTrailingSlash(normalizePath(current.path))
        const entries = await listRemoteFiles(operator, remotePath, current.recursive)

        if (entries === undefined) {
            logger.warn(`Remote path does not exist yet: ${remotePath}`)
            continue
        }

        for (const entry of entries) {
            const key = normalizePath(entry.path())

            if (key === manifestKey || key.endsWith('/')) {
                continue
            }

            files[key] = { size: -1 }
        }
    }

    logger.info(`Bootstrapped S3 upload manifest with ${Object.keys(files).length} remote assets.`)

    return {
        version: 1,
        generatedAt: new Date().toISOString(),
        files,
    }
}

async function readRemoteFile(operator: Operator, key: string) {
    return operator.read(key).catch((error: unknown) => {
        if (isNotFoundError(error)) {
            return undefined
        }

        throw error
    })
}

async function listRemoteFiles(operator: Operator, remotePath: string, recursive: boolean) {
    return operator.list(remotePath, { recursive }).catch((error: unknown) => {
        if (isNotFoundError(error)) {
            return undefined
        }

        throw error
    })
}

function collectUploadTasks(buildPath: string, uploadPaths: ResolvedUploadPath[], manifest: AssetManifest): UploadTask[] {
    const tasks: UploadTask[] = []

    for (const current of uploadPaths) {
        collectUploadTasksForPath(path.join(buildPath, current.path), current, manifest, tasks)
    }

    return tasks
}

function collectUploadTasksForPath(
    absolutePath: string,
    current: ResolvedUploadPath,
    manifest: AssetManifest,
    tasks: UploadTask[],
) {
    if (!fs.existsSync(absolutePath)) {
        return
    }

    const stats = fs.statSync(absolutePath)

    if (stats.isDirectory()) {
        for (const filename of fs.readdirSync(absolutePath)) {
            if (filename.startsWith('.')) {
                continue
            }

            const nextRelativePath = path.join(current.path, filename)
            const nextAbsolutePath = path.join(absolutePath, filename)

            if (current.recursive || !fs.statSync(nextAbsolutePath).isDirectory()) {
                collectUploadTasksForPath(nextAbsolutePath, { ...current, path: nextRelativePath }, manifest, tasks)
            }
        }

        return
    }

    const key = normalizePath(current.path)
    const manifestEntry = manifest.files[key]

    if (!current.override && manifestEntry !== undefined && (manifestEntry.size === -1 || manifestEntry.size === stats.size)) {
        return
    }

    tasks.push({
        key,
        filePath: absolutePath,
        size: stats.size,
    })
}

async function uploadFile(operator: Operator, task: UploadTask) {
    const content = fs.readFileSync(task.filePath)
    await operator.write(task.key, content, { contentType: getContentType(task.key) })
}

async function writeManifest(operator: Operator, manifestKey: string, manifest: AssetManifest) {
    await operator.write(
        manifestKey,
        `${JSON.stringify(manifest, null, 2)}\n`,
        { contentType: 'application/json' },
    )
}

function removeUploadedDirectories(buildPath: string, uploadPaths: ResolvedUploadPath[], logger: Logger) {
    for (const current of uploadPaths) {
        if (current.keep || !current.recursive) {
            continue
        }

        const resolvedPath = path.join(buildPath, current.path)

        if (fs.existsSync(resolvedPath)) {
            fs.rmSync(resolvedPath, { recursive: true, force: true })
            logger.info(`Remove the path: ${resolvedPath}`)
        }
    }
}

async function runWithConcurrency<T>(
    items: T[],
    concurrency: number,
    handler: (item: T) => Promise<void>,
) {
    let cursor = 0

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (cursor < items.length) {
            const item = items[cursor]
            cursor += 1
            await handler(item)
        }
    })

    await Promise.all(workers)
}

function normalizePath(current: string) {
    return current.includes(path.win32.sep)
        ? current.split(path.win32.sep).join(path.posix.sep)
        : current
}

function ensureTrailingSlash(current: string) {
    return current.endsWith('/') ? current : `${current}/`
}

function isNotFoundError(error: unknown) {
    return error instanceof Error && error.toString().includes('NotFound')
}

function getContentType(key: string) {
    const ext = path.extname(key).toLowerCase()
    const contentTypes: Record<string, string> = {
        '.avif': 'image/avif',
        '.css': 'text/css; charset=utf-8',
        '.gif': 'image/gif',
        '.html': 'text/html; charset=utf-8',
        '.ico': 'image/x-icon',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.map': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.svg': 'image/svg+xml; charset=utf-8',
        '.txt': 'text/plain; charset=utf-8',
        '.webp': 'image/webp',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.xml': 'application/xml; charset=utf-8',
    }

    return contentTypes[ext]
}
