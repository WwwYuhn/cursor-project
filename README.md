# Apple 3D UI Previewer

An interactive bilingual design tool for previewing UI mockups on Apple device models in 3D.

## Project Summary

`Apple 3D UI Previewer` is a web-based design tool built for visual communication and interface presentation workflows. Users can upload a PNG/JPG UI mockup and preview it on Apple device models such as iPhone and MacBook in a real-time 3D scene.

The project focuses on presentation quality, bilingual accessibility, and interactive device mockup review.

## Core Features

- Real-time 3D preview with Apple device models
- Upload PNG/JPG interface mockups and map them onto device screens
- Bilingual interface with English / Chinese toggle
- iPhone portrait / landscape preview
- Fit / Fill preview modes
- Image adjustment controls:
  - rotation
  - scale
  - brightness
  - contrast
  - position dragging
- Undo / Redo history
- Export PNG preview
- Global preview mode
- Static export support for presentation and sharing

## Design Purpose

This tool was created to support the visual communication design process by making it easier to:

- present UI work in a more polished and realistic way
- compare screen layouts on different Apple devices
- simulate presentation-ready mockups without opening heavy 3D software
- improve visual decision-making during UI review and iteration

## Product brief (HTML)

A standalone **bilingual** (English default, 中文 optional) product / design rationale page ships with the repo:

| | |
| --- | --- |
| **Source file** | [`public/presentation.html`](public/presentation.html) |
| **Launch icon** (referenced at page bottom) | [`public/app-icon.svg`](public/app-icon.svg) |
| **After static export** | `out/presentation.html` and `out/app-icon.svg` (copied from `public/`) |

**How to view**

- Open [`public/presentation.html`](public/presentation.html) in a browser from a local checkout (same folder as `app-icon.svg` so the icon loads), **or**
- Run `npm run export:static` then open `out/presentation.html` via a local static server (e.g. `npm run serve:static` and visit `/presentation.html`).

After you enable **GitHub Pages** (see [GitHub Pages](#github-pages) below), the live URLs use your repo name as the path, for example:

- App: `https://WwwYuhn.github.io/cursor-project/`
- Product brief: `https://WwwYuhn.github.io/cursor-project/presentation.html`

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- React Three Fiber
- `@react-three/drei`
- Three.js
- Zustand

## Bilingual Support

The app includes a language switcher and supports:

- Chinese
- English

## How To Run

### Development Mode

```bash
cd "/Users/yuhan/Desktop/cursor-project"
npm install
npm run dev
```

Then open the local address shown in the terminal.

### Static Export Mode

```bash
cd "/Users/yuhan/Desktop/cursor-project"
npm run export:static
npm run serve:static
```

Then open:

[http://127.0.0.1:4173](http://127.0.0.1:4173)

### One-Click Static Preview

You can also use:

`open-static-preview.command`

This script exports the static site and opens a local preview server automatically.

## Project Structure

```text
app/                  Next.js app router pages and global styles
components/           UI components and 3D scene components
lib/                  Zustand store, device config, i18n helpers
public/               Static assets; includes presentation.html + app-icon.svg
public/models/        GLB device model files
out/                  Static export output
```

## Device Models

Current supported categories:

- iPhone
- Mac

Device model files are stored in:

`public/models`

## API Key Note

This project does not require a private API key in order to run.

If any external service is added later, do not commit API keys into the repository.

## Presentation Links

- **Product brief page (HTML, in repo):** [`public/presentation.html`](public/presentation.html) — see [Product brief (HTML)](#product-brief-html) above
- **YouTube presentation:** [https://youtu.be/oH-4LvWrNks](https://youtu.be/oH-4LvWrNks)
- **GitHub Pages (live demo):** [https://WwwYuhn.github.io/cursor-project/](https://WwwYuhn.github.io/cursor-project/) — same app as static export; brief at [presentation.html](https://WwwYuhn.github.io/cursor-project/presentation.html) *(URL works after Pages is enabled and the first deploy finishes; see [GitHub Pages](#github-pages))*

## GitHub Pages

This repo includes [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). On every push to `main`, it builds a static export and deploys the `out/` folder to **GitHub Pages**.

### One-time setup (in the GitHub website)

1. Open your repository on GitHub → **Settings** → **Pages** (左侧菜单).
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**（不要选 “Deploy from a branch” 除非你知道自己在做什么）.
3. Save if needed. 推送 `main` 后会自动跑工作流。

### Check that it worked

1. 打开 **Actions** 标签页，确认 **Deploy GitHub Pages** 工作流是绿色成功。
2. 几分钟后访问：**https://WwwYuhn.github.io/cursor-project/**  
   若 404，再等 1～2 分钟或硬刷新。

### 说明

- 构建时通过环境变量 `GITHUB_REPOSITORY` 自动设置 `basePath` 为 `/cursor-project`，与项目站路径一致。若你**改名仓库**，下次推送会自动按新仓库名重新构建。
- 本地开发仍用 `npm run dev`，**不需要** basePath；只有 CI 里的 `npm run build` 会带前缀。

## Group Members

| English Name | Chinese Name | Student ID |
| --- | --- | --- |
| Wang Yuhan | 王语晗 | MC569064 |
| Zou Yiyang | 邹艺洋 | MC569218 |

## Repository

- **Final repo:** [https://github.com/WwwYuhn/cursor-project](https://github.com/WwwYuhn/cursor-project)
- **Main branch:** `main`

## Submission Checklist

- [x] Project runs locally
- [x] Bilingual switch included
- [x] Final version prepared for `main` branch
- [x] README member information completed
- [x] YouTube presentation link added
- [x] Github Pages presentation link added
- [x] Final repository link confirmed

## Notes

- The final static export is generated into `out/`
- For reliable model loading, use a local server instead of opening `index.html` directly via `file://`
