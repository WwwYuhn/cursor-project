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

If you host **GitHub Pages** from the `out/` output, the brief page URL is typically `https://<user>.github.io/<repo>/presentation.html` (adjust to your actual base path).

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
- **GitHub Pages** (if used): `（待补充 / To be added）` — optional; the brief is at `/presentation.html` when `out/` is served as site root

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
- [ ] Github Pages presentation link added
- [x] Final repository link confirmed

## Notes

- The final static export is generated into `out/`
- For reliable model loading, use a local server instead of opening `index.html` directly via `file://`
