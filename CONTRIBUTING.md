# Contributing to RouteCase

Thank you for your interest in contributing to **RouteCase**!

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/routecase/routecase.git
   cd routecase
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run compile
   ```

4. **Run the automated test suite:**
   ```bash
   npm test
   ```

5. **Package the extension:**
   ```bash
   npx @vscode/vsce package --no-git-tag-version
   ```

## Running & Debugging in VS Code

1. Open the project in VS Code: `code .`
2. Press `F5` to start a new **Extension Development Host** window.
3. In the new window, open any folder containing `.rcase` files (e.g. `examples/superheroes.rcase`) and test the features interactively.

## Submitting Pull Requests

- Ensure all 33+ unit and integration tests pass (`npm test`).
- Add tests for any new features or bug fixes.
- Follow existing formatting and strict TypeScript type guidelines.
