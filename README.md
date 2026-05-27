# Bajaj eKYC

A static **HTML / CSS** eKYC flow built on the **Atlas / Bigil** design system
(`@atlas-ds/*`). No framework, no build step — just open the HTML files.

## How it works

The design system ships as two bundled files, vendored into this repo:

| File | Source package | Contents |
| --- | --- | --- |
| `assets/atlas/atlas.css` | `@atlas-ds/css` (+ `@atlas-ds/tokens`) | Design tokens, base layer, and **every** component's CSS |
| `assets/atlas/atlas.js` | `@atlas-ds/js` | Component logic; **self-initializes** on load and watches for new DOM |

Pages use design-system markup directly, e.g.:

```html
<button class="btn btn-primary">Continue</button>
```

Interactive components (`otp-group`, `form-field`, `segmented-control`, `tile`,
`bl-tabs-list`) need **no manual wiring** — `atlas.js` initializes them
automatically.

Two external dependencies are loaded via CDN in each page:

- **Rubik** font (the typeface the Atlas base layer expects)
- **Lucide** icons (`<i data-lucide="icon-name"></i>`, rendered by `js/app.js`)

## Project structure

```
bajaj-ekyc/
├── index.html              # entry screen
├── pages/                  # individual eKYC step pages
├── _template.html          # base shell to copy when adding a screen
├── assets/
│   ├── atlas/              # vendored design-system bundle (do not hand-edit)
│   │   ├── atlas.css
│   │   └── atlas.js
│   └── img/                # logos, illustrations
├── css/app.css             # project layout & overrides ONLY
├── js/app.js               # icon rendering + page glue
└── scripts/sync-atlas.sh   # rebuild & re-vendor the design system bundle
```

## Adding a screen

1. Copy `_template.html` to `pages/<screen>.html`.
2. Replace the `PAGE_TITLE` and the `<main class="ekyc-shell">` content with
   design-system component markup.
3. Use tokens (`var(--color-*)`, `var(--space-*)`) for any custom styling in
   `css/app.css`.

## Updating the design system

When the design system repo changes, refresh the vendored bundle:

```bash
scripts/sync-atlas.sh /path/to/bigil-library
```

(Defaults to a sibling checkout named `bigil-library` if no path is given.)

## Running locally

It's static — any of these work:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
# or
npx serve .
```

## Design system source

Components come from the **Bigil Library** monorepo
(`https://github.com/shikhar-rsp/BGIL-LIBRARY`), packages `@atlas-ds/tokens`,
`@atlas-ds/css`, `@atlas-ds/js`.
