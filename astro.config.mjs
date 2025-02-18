import { defineConfig, passthroughImageService, sharpImageService } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import partytown from '@astrojs/partytown'
import { SITE } from './src/config.ts'
import { remarkReadingTime } from './src/support/plugins.ts'
import { uploadAssetsToS3 } from './src/support/uploader.ts'

// 用于配置Astro项目的设置。Astro是一个用于构建静态网站的现代前端框架。下面是这个配置文件中各个部分的作用：
// 导入依赖模块：
// defineConfig, passthroughImageService, sharpImageService：从astro/config模块导入，用于定义Astro项目的配置和图像服务。
// mdx, tailwind, react, sitemap, partytown：从不同的Astro插件导入，用于集成MDX、Tailwind CSS、React、站点地图和Partytown等功能。
// SITE：从项目中的./src/config.ts文件导入，包含站点配置信息。
// remarkReadingTime：从项目中的./src/support/plugins.ts文件导入，用于在Markdown文件中添加阅读时间插件。
// uploadAssetsToS3：从项目中的./src/support/uploader.ts文件导入，用于将静态资源上传到S3。
// 配置Astro项目：

// site：设置站点的URL。
// image：配置图像服务，根据环境变量ASTRO_IMAGE_OPTIMIZE决定是否使用sharpImageService进行图像优化，否则使用passthroughImageService直接传递图像。
// integrations：集成各种Astro插件和自定义功能，如Partytown、MDX、Tailwind CSS、React、站点地图、资源压缩和上传到S3。
// markdown：配置Markdown解析器，使用remarkReadingTime插件，并设置代码高亮主题。
// devToolbar：禁用开发者工具栏。
// prefetch：启用页面预加载。
// output：设置构建输出为静态站点。
// build：配置构建选项，包括资源目录和资源前缀。如果环境变量S3_ENABLE为真，则资源前缀设置为S3的CDN URL。

export default defineConfig({
    site: SITE.url,
    image: {
        // 如果不想在构建过程中优化图像，请将 ASTRO_IMAGE_OPTIMIZE 环境变量设置为 false。请注意，在 Cloudflare Pages 上，这里的环境值是 `字符串`类型，所以如果想禁用图像优化服务，请直接删除环境变量。
        service: (!!import.meta.env.ASTRO_IMAGE_OPTIMIZE || !!process.env.ASTRO_IMAGE_OPTIMIZE) ? sharpImageService() : passthroughImageService(),
    },
    integrations: [
        partytown(),
        mdx({
            extendMarkdownConfig: true,
        }),
        sitemap(),
        tailwind(),
        react(),
        (await import('@playform/compress')).default({
            CSS: true,
            HTML: true,
            Image: false,
            JavaScript: true,
            SVG: true,
            Logger: 2,
        }),
        uploadAssetsToS3(),
    ],
    markdown: {
        remarkPlugins: [remarkReadingTime],
        shikiConfig: {
            theme: 'github-light',
            themes: {
                light: 'github-light',
                dark: 'github-dark',
            },
            wrap: false,
        },
    },
    devToolbar: {
        enabled: false,
    },
    prefetch: true,
    output: 'static',
    build: {
        // 指定构建输出目录中Astro生成的资源（例如捆绑的JS和CSS）应存放的位置。 
        // https://docs.astro.build/en/reference/configuration-reference/#buildassets
        assets: 'assets',
        // see https://docs.astro.build/en/reference/configuration-reference/#buildassetsprefix
        assetsPrefix: (!!import.meta.env.S3_ENABLE || !!process.env.S3_ENABLE) ? 'https://assets.dong4j.dev/blog' : '',
    },
})
