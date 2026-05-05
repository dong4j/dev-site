# Gblog is an open-source, simple, and beautiful blog built with Astro.

![godruoyi gblog](https://images.godruoyi.com/logos/gblog-1.png)

Gblog is a blog template designed for those who are unable or unwilling to write frontend code. All you need to do is find an interesting Tailwind CSS template from elsewhere and paste it into Gblog, and it will function seamlessly. Additionally, you can customize your own blog without to write any JavaScript code.

**[View Live Demo](https://godruoyi.com)**

## Features

- 🐈 Simple And Beautiful
- 🖥️️ Responsive And Light/Dark mode
- 🐛 SiteMap & RSS Feed
- 🐝 Category and Timeline Support
- 🍋 Google Analytics & Google Structured Data
- 🐜 SEO and Responsiveness
- 🪲 Markdown And MDX
- 🏂🏾 Page Compression & Image Optimization

## Make Your Own

You can use this template directly to build your own blog in four different ways.

https://github.com/godruoyi/gblog/assets/16079222/773cd885-d4b7-482d-818f-566606e70b90

### Deploy to Zeabur

[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/6FMSVU)

Click the button above to build your blog to Zeabur within one minute.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgodruoyi%2Fgblog%2Ftree%2Fgblog-template&project-name=gblog&repository-name=my-gblog&demo-title=%E8%BF%9E%E6%B3%A2%E7%9A%84%E9%97%B2%E8%B0%88%E6%9D%82%E9%B1%BC&demo-description=Godruoyi's%20private%20blog&demo-url=https%3A%2F%2Fgodruoyi.com)

### Build from Source

1. Clone the `gblog-template` branch of this repository `git clone -b gblog-template git@github.com:godruoyi/gblog.git`
2. Execute `pnpm install` to install dependencies.
3. Modify the `src/config.ts` file to what you want.
4. Execute `pnpm run dev`: Starts a local development server with hot reloading enabled.

### Build from Astro Template(coming soon)

```
pnpm create astro@latest -- --template godruoyi/gblog
```

### Development Commands

With dependencies installed, you can utilize the following npm scripts to manage your project's development lifecycle:

- `pnpm run dev`: Starts a local development server with hot reloading enabled.
- `pnpm run preview`: Serves your build output locally for preview before deployment.
- `pnpm run build`: Bundles your site into static files for production.

For detailed help with Astro CLI commands, visit [Astro's documentation](https://docs.astro.build/en/reference/cli-reference/).

## Cloudflare 部署与 S3/R2 增量上传

Cloudflare Pages 会读取项目根目录的 `.node-version` 来选择 Node.js 版本。当前项目锁定为 `22.16.0`，避免使用 Cloudflare 旧构建镜像默认的 `18.17.1` 导致 Astro 构建失败。

这个项目在 Cloudflare Pages 构建时会根据 `S3_ENABLE` 决定是否把 `dist/assets` 上传到 S3/R2，并通过 `build.assetsPrefix` 把资源地址切到 `https://assets.dong4j.dev/blog`。

早期使用 `astro-uploader` 时，它虽然会跳过远端已存在的文件，但每次构建都会递归扫描 `assets`，并对每个文件执行一次远端 `stat`。博客图片变多后，即使全部都是 `exists on backend, skip`，Cloudflare 部署也会被大量远端检查拖慢。

现在改成了项目内自定义的增量上传器：

- 入口文件：`src/support/uploader.ts`
- 配置位置：`src/config.ts` 的 `Settings.Assets.config`
- 远端 manifest：`blog/assets/.upload-manifest.json`
- 默认上传目录：`dist/assets`
- 默认并发数：`8`，可用 `S3_UPLOAD_CONCURRENCY` 调整

上传流程：

1. Astro 正常生成 `dist/assets`。
2. 上传器读取远端 `assets/.upload-manifest.json`。
3. 本地扫描本次构建生成的 `assets` 文件。
4. 只上传 manifest 中不存在，或 size 不一致的文件。
5. 上传完成后更新 manifest。
6. 和原逻辑一样，在 `keep` 为 `false` 时删除本地 `dist/assets`，因为页面资源会走 CDN 前缀。

首次启用时，如果远端还没有 manifest，上传器不会直接重传所有历史图片，而是会先 `list assets/` 建立一份初始 manifest。由于 Astro 产物文件名已经带 hash，例如 `xxx.Brn8hQPy.webp`，文件名不变基本就代表内容不变，所以后续部署只需要处理新增 hash 文件。

注意事项：

- 不要手动删除远端 `blog/assets/.upload-manifest.json`，否则下一次部署会重新从远端 assets 列表 bootstrap。
- 如果确实要强制覆盖某个资源，可以删除 manifest 里的对应 key，或临时把 `override` 设为 `true`。
- 如果手动删除了 R2/S3 上的某些资源，但 manifest 里还保留记录，上传器会认为它已经存在。遇到这种情况，需要同步清理 manifest。
- `S3_ENABLE` 在 Cloudflare Pages 中只要环境变量存在就会被视为开启；要关闭上传，需要删除这个环境变量，而不是设置成字符串 `false`。

## Thanks 

Thanks https://github.com/mearashadowfax/ScrewFast, The majority of the code for this project comes from ScrewFast.

## License

This project is released under the MIT License. Please read the [LICENSE](https://github.com/godruoyi/gblog/blob/astro/LICENSE) file for more details.
