---
title: "Hexo Theme Aurora 主题图片居中显示的解决方案"
pubDate: "2021-03-29"
category: "share"
banner: "./hexo-theme-aurora-images-centered/cover.webp"
tags:
  - "Hexo"
  - "学习笔记"
toc: true
---

## 简介

记录一下如何将 `hexo-theme-aurora` 主题的博客图片居中显示

修改文件: `node_modules/hexo-theme-aurora/source/static/css/a14e1a22.css`:

```css
.post-html img {
  margin: auto;
  cursor: zoom-in;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.15s;
}
```
