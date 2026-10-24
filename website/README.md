# RouteCase Documentation Portal & Marketing Website

This directory contains the source code for the official **RouteCase** product website and documentation portal, powered by **VitePress**.

---

## Architecture & Technology

- **Static Site Generator:** [VitePress](https://vitepress.dev/)
- **Search Engine:** Built-in client-side instant local search (offline, zero API dependencies)
- **Syntax Highlighter:** Shiki with modern dark theme
- **Styles:** Custom CSS design system matching RouteCase brand palette (Obsidian Dark `#0B0F17`, Clean Crisp Light `#FFFFFF`, Vibrant Emerald `#10B981`, Mint `#34D399`)
- **Assets:** Official Highway-R brand mark, logos, and Activity Bar vectors in `/public`

---

## Local Development

From the workspace root directory:

```bash
# Start the local development server with hot-reload
npm run website:dev

# Or directly from the website directory
cd website
npm run dev
```

The site will be available locally at `http://localhost:5173`.

---

## Production Build

To generate the production-ready static assets:

```bash
# Build from the workspace root
npm run website:build

# Or directly from the website directory
cd website
npm run build
```

The generated files are emitted into:
```text
website/.vitepress/dist/
```

To preview the production build locally:
```bash
npm run website:preview
```

---

## Deployment Options

### 1. Deploying to Vercel (Recommended)
1. Import your GitHub repository in the Vercel Dashboard.
2. In **Project Settings**:
   - **Root Directory:** `website`
   - **Framework Preset:** `VitePress` (or `Other`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.vitepress/dist`
3. Click **Deploy**.

### 2. Deploying to Netlify
1. Create a new site from your Git repository in Netlify.
2. Configure **Build Settings**:
   - **Base directory:** `website`
   - **Build command:** `npm run build`
   - **Publish directory:** `website/.vitepress/dist`
3. Click **Deploy site**.

### 3. Deploying to GitHub Pages (GitHub Actions)
Add `.github/workflows/deploy-site.yml` to your repository:

```yaml
name: Deploy Documentation Site

on:
  push:
    branches: [main]
    paths:
      - 'website/**'

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: website/package-lock.json
      - name: Install dependencies
        run: cd website && npm ci
      - name: Build site
        run: cd website && npm run build
      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: website/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Content Organization

```text
website/
├── .vitepress/
│   ├── config.mts       # Navigation, sidebar, search, and SEO meta
│   └── theme/
│       ├── custom.css   # Obsidian & Emerald Green design system (Light & Dark mode)
│       └── index.ts     # Theme entrypoint
├── docs/
│   ├── introduction/    # Project vision, features, and capabilities
│   ├── getting-started/ # Installation and 3-minute quickstart
│   ├── core-concepts/   # Architecture, endpoints, lifecycle, results
│   ├── variables/       # Environments, token chaining, dynamic generators
│   ├── reference/       # Schema, assertions, HTTP methods, commands, settings
│   ├── tutorials/       # Express, JWT auth, pagination, public APIs, OpenAPI
│   ├── troubleshooting/ # Common connection and configuration errors
│   ├── faq/             # Frequently asked questions
│   └── contributing/    # Developer setup and contribution guide
├── public/              # High-res logos, icons, and static assets
├── index.md             # Marketing landing page with interactive mockups
├── package.json         # Website scripts and dependencies
└── README.md            # This documentation
```
