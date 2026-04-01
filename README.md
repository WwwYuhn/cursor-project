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
```

Static export and preview:

```bash
npm run export:static
npm run serve:static
# Open http://127.0.0.1:4173
```

Optional: run `open-static-preview.command` (macOS) to export and serve.

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
