# Apple 3D UI Previewer

## Links

| Resource | Link |
| --- | --- |
| GitHub repository | [github.com/WwwYuhn/cursor-project](https://github.com/WwwYuhn/cursor-project) |
| GitHub Pages (product brief) | [WwwYuhn.github.io/cursor-project](https://WwwYuhn.github.io/cursor-project/) |
| YouTube presentation | [youtu.be/oH-4LvWrNks](https://youtu.be/oH-4LvWrNks) |
| Product brief (source in repo) | [`public/presentation.html`](public/presentation.html) |
| Launch icon (SVG) | [`public/app-icon.svg`](public/app-icon.svg) |

GitHub Pages serves the bilingual product brief only. The interactive 3D app runs locally (see below).

## Overview

Web tool for previewing PNG/JPG UI mockups on Apple device models (iPhone, MacBook) in a real-time 3D scene. English / Chinese UI. Built for visual communication and presentation workflows.

## Features

- 3D preview, upload mockups, map to device screens  
- Portrait / landscape, Fit / Fill, image adjustments (rotation, scale, brightness, contrast, drag)  
- Undo / Redo, export PNG, global preview mode  
- Static export (`out/`) for local hosting  

## Run locally

```bash
cd cursor-project
npm install
npm run dev
# 浏览器打开 http://127.0.0.1:3000（默认只绑定本机回环，避免部分环境下 next dev 因枚举网卡失败而退出）
```

若需要局域网其他设备访问，改用 `npm run dev:lan`。

Static export and preview:

```bash
npm run export:static
npm run serve:static
```

**Important:** `serve:static` runs a small Node static server that binds to **127.0.0.1** on an **OS-assigned free port** (avoids “Address already in use”). The terminal prints the exact URL (for example `http://127.0.0.1:52xxx`)—open that link while the process keeps running.

Optional: run `open-static-preview.command` (macOS) to export and serve.

If the exported site is **not** at the domain root (for example it lives at `https://example.com/.../out/index.html`), the browser would otherwise request `/_next/...` and `/models/...` from the wrong URL and the app would stay on “正在准备预览…”. Set a **path prefix with no trailing slash**, then rebuild and upload the whole `out/` folder:

```bash
NEXT_PUBLIC_BASE_PATH=/ARTD7104DesignTools/student-projects/10-cursor-project/out npm run build
```

Use the prefix that matches the folder URL **before** `index.html` (everything after the host, without a trailing slash).

## Tech stack

Next.js 15, React 19, TypeScript, Tailwind CSS, React Three Fiber, `@react-three/drei`, Three.js, Zustand.

## Project structure

```text
app/              App Router, styles
components/       UI and 3D scene
lib/              Store, devices, i18n
public/           presentation.html, app-icon.svg, models/
out/              Static export output (after build)
```

Device GLB files live in `public/models/` (iPhone, Mac).

## Push source code to GitHub

`out/` is listed in `.gitignore`, so **build output is not pushed**—only source. Others clone and run `npm install` + `npm run dev` or build locally.

```bash
cd cursor-project
git status
git add -A
git commit -m "Describe your change"
git push origin main
```

First time: create an empty repo on GitHub, then `git remote add origin https://github.com/<user>/<repo>.git` (or SSH), then `git push -u origin main`.

## Run the built site stably (course server / any static host)

1. Match the **URL path** where `index.html` will live (everything after the host, **no** trailing slash), e.g.  
   `/ARTD7104DesignTools/student-projects/10-cursor-project/out`
2. Build and produce `out/`:

```bash
NEXT_PUBLIC_BASE_PATH=/ARTD7104DesignTools/student-projects/10-cursor-project/out npm run build
```

3. Upload the **entire** `out/` directory to that folder on the server (keep `_next/`, `models/`, `index.html` together).  
4. Open `…/out/index.html` over **https** (or **http**), not `file://`.

If the folder path on the server changes, **rebuild** with the new `NEXT_PUBLIC_BASE_PATH` and upload `out/` again.

## GitHub Pages

Workflow: [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). On push to `main`, it publishes `public/presentation.html` as `index.html` plus `app-icon.svg`.

**Setup (once):** Repository **Settings → Pages → Source: GitHub Actions**. After a successful workflow run, use the Pages URL in the table above.

## Group members

| English name | Chinese name | Student ID |
| --- | --- | --- |
| Wang Yuhan | 王语晗 | MC569064 |
| Zou Yiyang | 邹艺洋 | MC569218 |

## Notes

- No API keys required for the current project.  
- Serve the static build over HTTP (e.g. `npm run serve:static`); avoid opening `out/index.html` via `file://` for reliable model loading.
