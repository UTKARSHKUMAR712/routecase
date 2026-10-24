# Installation Guide

RouteCase can be installed either directly from the Visual Studio Marketplace or manually via an offline VSIX package.

---

## Method 1: Visual Studio Marketplace (Recommended)

1. Open Visual Studio Code.
2. Open the **Extensions view** by pressing `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS).
3. In the search bar, type:
   ```text
   RouteCase
   ```
4. Look for **RouteCase — API Route & Endpoint Tester** published by **UtkarshKumar**.
5. Click **Install**.

Or install directly from your terminal:

```bash
code --install-extension UtkarshKumar.routecase
```

Link: [RouteCase on Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=UtkarshKumar.routecase)

---

## Method 2: Manual Offline VSIX Installation

If you are working in an air-gapped enterprise environment without internet access or testing a custom build:

1. Download the latest `.vsix` file from the [RouteCase GitHub Releases](https://github.com/UTKARSHKUMAR712/routecase/releases).
2. Install via command line:
   ```bash
   code --install-extension routecase-0.2.0.vsix --force
   ```
3. Or inside VS Code:
   - Go to the **Extensions view** (`Ctrl+Shift+X`).
   - Click the **`...`** (Views and More Actions) menu in the top-right corner.
   - Select **Install from VSIX...**
   - Choose the downloaded `.vsix` file.

---

## Verifying the Installation

To verify that RouteCase is active:

1. Open any workspace folder.
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
3. Type:
   ```text
   RouteCase: Create Example Test File
   ```
4. If RouteCase prompts you with a list of template suites, installation was successful!

---

## Updating RouteCase

- **Marketplace Installations:** VS Code updates extensions automatically by default. You can also manually check for updates in the Extensions view (`Check for Extension Updates`).
- **Offline VSIX Installations:** Simply repeat the manual installation steps using the newer `.vsix` file. Your `.rcase` test files will never be modified or overwritten during updates.

---

## Uninstallation

If you ever need to remove RouteCase:
1. Go to the **Extensions view** (`Ctrl+Shift+X`).
2. Search for `RouteCase`.
3. Click the gear icon next to RouteCase and click **Uninstall**.
4. Reload VS Code. (All your `.rcase` files remain untouched in your workspace).
