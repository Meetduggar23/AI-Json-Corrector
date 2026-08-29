<p align="center">
  <img src="public/logo.svg" alt="JSON Corrector Logo" width="96" height="96" />
</p>

<h1 align="center">JSON Corrector</h1>

<p align="center">
  A client-side JSON validation, repair, and formatting tool.<br/>
  All processing is done locally — <strong>nothing leaves your machine</strong>.
</p>

<p align="center">
  <a href="#features">Features</a> · 
  <a href="#quick-start">Quick Start</a> · 
  <a href="#keyboard-shortcuts">Shortcuts</a> · 
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## Features

| Feature | Description |
|---------|-------------|
| **Validate** | Check JSON syntax and structure with detailed error reporting |
| **Repair** | Automatically fix common JSON errors (missing commas, trailing commas, quotes) |
| **Beautify** | Pretty-print JSON with configurable indentation (2/4/8 spaces or tabs) |
| **Minify** | Compress JSON by removing all whitespace |
| **Schema Validation** | Validate JSON against a JSON Schema |
| **Diff Viewer** | Compare original and corrected JSON side-by-side |
| **History** | Undo/redo support with full edit history |
| **Dark/Light Theme** | Toggle between dark and light modes |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Run validation |
| `Ctrl+S` | Save / Download |
| `Ctrl+F` | Search |
| `Ctrl+Shift+B` | Toggle sidebar |
| `Ctrl+Shift+]` | Toggle right panel |
| `F2` | Rename file |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS v4** — Styling
- **Zustand** — State management
- **Monaco Editor** — Code editor (VS Code's editor)
- **React Router v7** — Routing
- **Lucide React** — Icons
- **Framer Motion** — Animations
- **jsonrepair** — JSON auto-repair engine
- **AJV** — JSON Schema validation

---

<p align="center">
  Made By <strong>Meet Duggar</strong>
</p>
