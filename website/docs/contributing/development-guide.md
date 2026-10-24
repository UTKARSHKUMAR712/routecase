# Developer & Contributing Guide

We welcome contributions from the developer community! This guide details how to set up the RouteCase extension locally, run the test suite, and submit pull requests.

---

## Workspace Setup

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher
- Visual Studio Code `v1.90.0` or higher

### Clone & Install
```bash
git clone https://github.com/UTKARSHKUMAR712/routecase.git
cd routecase
npm install
```

---

## Project Structure

```text
├── src/
│   ├── engine/          # Core execution, assertions, template, variables, redaction
│   ├── importer/        # OpenAPI & Swagger parser
│   ├── models/          # TypeScript interfaces & types
│   ├── parser/          # JSON parser & Draft-07 schema validator
│   ├── providers/       # CodeLens provider, scanner, Tree view provider
│   ├── webview/         # Results panel HTML/CSS/JS and HTML sanitization
│   └── extension.ts     # Activation entrypoint registering commands
├── schemas/
│   └── rcase.schema.json # JSON Schema Draft-07 definition
├── examples/            # Bundled .rcase test suites
├── tests/
│   ├── unit/            # Unit tests for engine components
│   └── integration/     # Integration tests with real HTTP loopback servers
├── website/             # VitePress documentation portal & marketing site
├── test-server/         # Express test server for integration validation
└── package.json         # Extension manifest & command contributions
```

---

## Development Commands

```bash
# Compile TypeScript code
npm run compile

# Watch for file changes
npm run watch

# Run the complete test suite (64 automated tests)
npm test

# Package the extension into a .vsix file
npx @vscode/vsce package --no-git-tag-version
```

---

## Debugging Inside VS Code

1. Open the project in VS Code: `code .`
2. Press `F5` (or go to **Run and Debug** > **Run Extension**).
3. An **Extension Development Host** window will open with RouteCase activated.
4. Open any `.rcase` file to test CodeLens actions, tree views, and commands with live breakpoints.

---

## Testing Guidelines

Before opening a pull request:
- All existing **64 tests** must pass cleanly (`npm test`).
- Add unit tests for any new parser, engine, or variable logic in `tests/unit/`.
- Ensure TypeScript strict typing produces zero compiler errors.
