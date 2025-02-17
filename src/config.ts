import type { NavigationLink, Site } from './types.ts'

export const SITE: Site = {
    author: 'dong4j',
    url: 'https://dong4j.dev',
    title: 'dong4j\'s dark room',
    description: 'dong4j\'s personal blog, I enjoy the process of building something using any technology stack',
    shortDescription: '',
}

export const NavigationLinks: NavigationLink[] = [
    { name: 'Posts', url: '/posts' },
    { name: 'Category', url: '/categories' },
    { name: 'Timeline', url: '/timeline' },
    { name: 'About', url: '/posts/about-dong4j' },
    { name: 'Friends', url: '/friends' },
]

export const FooterLinks = [
    {
        section: 'Blog',
        links: [
            { name: 'Posts', url: '/posts' },
            { name: 'Timeline', url: '/timeline' },
            { name: 'Categories', url: '/categories' },
            { name: 'About Me', url: '/posts/about-dong4j' },
        ],
    },
    {
        section: 'Other',
        links: [
            { name: 'RSS', url: '/rss.xml' },
            { name: 'Site Map', url: '/sitemap-index.xml' },
            { name: 'Twitter', url: 'https://x.com/dong4j' },
        ],
    },
]

export const Settings = {
    GoogleAnalytics: {
        enable: false,
        id: 'G-TKQ4L3ZDSF',
    },

    // See https://github.com/umami-software/umami
    // todo 使用自建服务
    UmamiAnalytics: {
        enable: false,
        dataWebsiteID: 'bf63658a-9418-4f39-a6a1-5a0cedb6e429',
    },

    Comment: {
        // 请注意，在Cloudflare Pages这里环境值是`string`类型。如果您想禁用评论系统，请删除`COMMENT_ENABLE`环境变量，而不仅仅是将其设置为`false`。
        enable: !!(import.meta.env.COMMENT_ENABLE) || !!process.env.COMMENT_ENABLE,

        // please visit https://giscus.app/ to learn how to configure it.
        // You can also check out this article: https://liruifengv.com/posts/add-comments-to-astro/.
        giscus: {
            repo: 'dong4j/dev-site',
            repoId: 'R_kgDON6tejA',
            category: 'Announcements',
            categoryId: 'DIC_kwDON6tejM4CnCGY',
            darkThem: 'preferred_color_scheme',
            lightThem: 'light',
        },
    },

    Assets: {
        // 如果您不想将构建断言（image/js/css等...）上传到任何地方，只需将其设置为false即可。请注意，在Cloudflare Pages中，这里的环境值是`string`类型。如果您想禁用评论系统，请删除`S3_ENABLE`环境变量，而不仅仅是将其设置为`false`。
        uploadAssetsToS3: !!(import.meta.env.S3_ENABLE) || !!process.env.S3_ENABLE,
        config: {
            // 请参阅 https://github.com/syhily/astro-uploader 了解如何配置上传器。以下配置会将编译后的 `assets` 文件夹上传到 S3 或 R2。
            // 可以为其设置一个单独的域名，以便使用 CDN 域名访问所有资源。
            // 例如：https://images.dong4j.com/gblog/assets/brand-logo.webp 注意，如果您想自动将所有图片/js/css 替换为 CDN 链接，可能还需要在 `astro.config.mjs` 中修改 `build.assetsPrefix`。
            paths: ['assets'],
            endpoint: (process.env.S3_ENDPOINT ?? import.meta.env.S3_ENDPOINT) as string,
            bucket: (process.env.S3_BUCKET ?? import.meta.env.S3_BUCKET) as string,
            accessKey: (process.env.S3_ACCESS_KEY ?? import.meta.env.S3_ACCESS_KEY) as string,
            secretAccessKey: (process.env.S3_SECRET_ACCESS_KEY ?? import.meta.env.S3_SECRET_ACCESS_KEY) as string,
            root: 'blog',
        },
    },
}

export const SEO = {
    title: SITE.title,
    description: SITE.description,
    structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'inLanguage': 'en-US',
        '@id': SITE.url,
        'url': SITE.url,
        'name': SITE.title,
        'description': SITE.description,
        'isPartOf': {
            '@type': 'WebSite',
            'url': SITE.url,
            'name': SITE.title,
            'description': SITE.description,
        },
    },
}
