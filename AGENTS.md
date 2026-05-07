# 仓库协作指南

## 项目结构与模块组织

本仓库是一个 Astro 博客站点，核心代码位于 `src/`。页面路由在 `src/pages/`，共享布局在 `src/layouts/`，UI 与博客组件在 `src/components/`，工具函数与构建辅助逻辑在 `src/support/`。
内容集合位于 `src/content/`：文章在 `src/content/posts/`，分类定义在 `src/content/categories/`，友链配置在 `src/content/friends/`。公共静态文件放在 `public/`，源码图片放在 `src/images/`。不要手动编辑 `dist/`、`.astro/` 等构建产物或缓存目录。

## 构建、测试与开发命令

本项目使用 `pnpm`。

- `pnpm install`：根据 `pnpm-lock.yaml` 安装依赖。
- `pnpm run dev`：启动 Astro 本地开发服务。
- `pnpm run build`：构建生产站点，并校验 Astro 内容。
- `pnpm run preview`：本地预览构建结果。
- `pnpm run lint`：运行 ESLint 检查整个仓库。
- `pnpm run lint:fix`：应用安全的 ESLint 自动修复。

当前没有独立的测试脚本。涉及行为变更时，至少运行 `pnpm run lint` 和 `pnpm run build`。

## 代码风格与命名规范

遵循仓库现有的 Astro、TypeScript、React 与 Markdown 风格。ESLint 配置位于 `eslint.config.js`，使用 `@antfu/eslint-config`，并集成 Astro、React 和格式化相关插件。
优先编写小而聚焦的组件；通用辅助逻辑放入 `src/support/`。内容 slug 与资源目录使用 kebab-case，例如 `src/content/posts/2026/block-yisouspider-cdn-traffic.md`。组件文件通常使用 PascalCase，例如 `BlogRecentCard.astro`。

## 内容与分类约束

`src/content/categories/*.md` 是分类真源。文件名是分类 slug，front matter 中的 `title` 是面向读者的分类名称。不要随意新增分类文件；从 Hexo 父仓库同步内容时，先确认目标分类已经存在于 dev-site。

## 提交与 Pull Request 规范

近期提交历史使用带 scope 的 Conventional Commit 风格，例如 `feat(dev-site): ...`、`docs(hexo): ...`、`refactor(dev-site): ...`。提交应保持聚焦，并使用最准确的 scope。
Pull Request 需要说明变更内容，列出已运行的验证命令；如有关联 issue，应一并链接；涉及可见 UI 变化时，请附截图。

## Agent 专用说明

始终使用中文回复。修改前先执行 `git status --short`，保护与当前任务无关的用户改动。优先遵循仓库已有约定，不做无关的大范围重构。
