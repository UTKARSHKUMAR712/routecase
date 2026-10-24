import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { parseRCase } from './parser/parser';
import { TestExecutor } from './engine/executor';
import { RouteCaseTreeProvider } from './providers/resultsTreeProvider';
import { RouteCaseResultsPanel } from './webview/resultsPanel';
import { RouteCaseCodeLensProvider } from './providers/codeLensProvider';
import { findCodeLensLocations } from './providers/codeLensScanner';
import { buildCurlCommand } from './engine/curl';
import { loadEnvironment } from './engine/environment';
import { convertOpenApiToRCase } from './importer/openApiImporter';
import { TestSuiteResult, ExecutionFilter } from './models/types';

let currentExecutor: TestExecutor | undefined;
let statusBarItem: vscode.StatusBarItem;
let treeProvider: RouteCaseTreeProvider;
let codeLensProvider: RouteCaseCodeLensProvider;
let lastSuiteResult: TestSuiteResult | undefined;

export function activate(context: vscode.ExtensionContext) {
  treeProvider = new RouteCaseTreeProvider();
  vscode.window.registerTreeDataProvider('routecase.resultsView', treeProvider);

  codeLensProvider = new RouteCaseCodeLensProvider();
  const codeLensDisposable = vscode.languages.registerCodeLensProvider(
    [
      { scheme: 'file', language: 'routecase' },
      { scheme: 'file', pattern: '**/*.rcase' },
      { scheme: 'file', pattern: '**/*.routecase' }
    ],
    codeLensProvider
  );
  context.subscriptions.push(codeLensDisposable);

  // Status Bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
  statusBarItem.text = '$(play) RouteCase';
  statusBarItem.tooltip = 'RouteCase: Click to run tests in active file';
  statusBarItem.command = 'routecase.runCurrentFile';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // 1. Run Tests in Current File (All cases)
  const runCurrentFileCmd = vscode.commands.registerCommand('routecase.runCurrentFile', async (uri?: vscode.Uri) => {
    const targetUri = uri || getActiveRCaseUri();
    if (!targetUri) {
      vscode.window.showWarningMessage('Please open or select a .rcase or .routecase file to run.');
      return;
    }
    await executeFile(targetUri, context);
  });

  // 2. Run All Tests across workspace
  const runAllCmd = vscode.commands.registerCommand('routecase.runAll', async () => {
    const files = await vscode.workspace.findFiles('**/*.{rcase,routecase}');
    if (files.length === 0) {
      vscode.window.showInformationMessage('No .rcase or .routecase files found in workspace.');
      return;
    }
    for (const file of files) {
      await executeFile(file, context);
    }
  });

  // 3. Run Single Test Case (Jupyter notebook style)
  const runSingleCaseCmd = vscode.commands.registerCommand(
    'routecase.runSingleCase',
    async (uri: vscode.Uri, endpointName: string, caseName: string) => {
      await executeFile(uri, context, { endpointName, caseName });
    }
  );

  // 4. Run Single Endpoint (All cases under that endpoint)
  const runEndpointCmd = vscode.commands.registerCommand(
    'routecase.runEndpoint',
    async (uri: vscode.Uri, endpointName: string) => {
      await executeFile(uri, context, { endpointName });
    }
  );

  // 5. Stop Test Run
  const stopRunCmd = vscode.commands.registerCommand('routecase.stopRun', () => {
    if (currentExecutor) {
      currentExecutor.cancel();
      vscode.window.showInformationMessage('RouteCase: Cancelling active test run...');
      statusBarItem.text = '$(debug-stop) RouteCase: Stopped';
    } else {
      vscode.window.showInformationMessage('RouteCase: No active test run to stop.');
    }
  });

  // 6. Validate Current File
  const validateCmd = vscode.commands.registerCommand('routecase.validateCurrentFile', async (uri?: vscode.Uri) => {
    const targetUri = uri || getActiveRCaseUri();
    if (!targetUri) {
      vscode.window.showWarningMessage('Please open a .rcase file to validate.');
      return;
    }
    try {
      const content = fs.readFileSync(targetUri.fsPath, 'utf8');
      const parseResult = parseRCase(content);
      if (parseResult.valid) {
        vscode.window.showInformationMessage(`RouteCase: "${path.basename(targetUri.fsPath)}" is valid!`);
      } else {
        const errorSummary = parseResult.errors.map(e => `• [${e.path}] ${e.message}`).join('\n');
        vscode.window.showErrorMessage(`RouteCase validation failed:\n${errorSummary}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Failed to read file: ${msg}`);
    }
  });

  // 7. Create Example Test File
  const createExampleCmd = vscode.commands.registerCommand('routecase.createExample', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('Please open a folder or workspace before creating an example test file.');
      return;
    }

    interface ExampleChoice extends vscode.QuickPickItem {
      file: string;
      targetName: string;
    }

    const choices: ExampleChoice[] = [
      {
        label: '$(sparkle) All-Features Master Suite',
        description: 'all-features.rcase',
        detail: 'Comprehensive showcase with all HTTP methods, parameters, bodies, and assertions',
        file: 'all-features.rcase',
        targetName: 'all-features.rcase'
      },
      {
        label: '$(globe) Live GitHub Public API',
        description: 'github-api.rcase',
        detail: 'Live requests against api.github.com — run immediately without a local server!',
        file: 'github-public-api.rcase',
        targetName: 'github-api.rcase'
      },
      {
        label: '$(package) E-Commerce CRUD API',
        description: 'ecommerce.rcase',
        detail: 'Products & Orders with POST, GET, PUT, DELETE, query filters, and bodies',
        file: 'ecommerce-crud.rcase',
        targetName: 'ecommerce.rcase'
      },
      {
        label: '$(lock) Auth, JWT & Security',
        description: 'auth.rcase',
        detail: 'Login, Bearer auth, RBAC, 401/403 errors, and credential redaction',
        file: 'auth-and-security.rcase',
        targetName: 'auth.rcase'
      },
      {
        label: '$(zap) Superhero Quick Start',
        description: 'superheroes.rcase',
        detail: 'Classic starter example showing path parameter expansion and assertions',
        file: 'superheroes.rcase',
        targetName: 'superheroes.rcase'
      },
      {
        label: '$(account) RESTful Users & Pagination',
        description: 'users-api.rcase',
        detail: 'User CRUD with query pagination, search, and validation',
        file: 'users-api.rcase',
        targetName: 'users-api.rcase'
      },
      {
        label: '$(bug) Error Handling & Edge Cases',
        description: 'error-handling.rcase',
        detail: 'Simulated 400, 404, 500 status codes, timeouts, and edge cases',
        file: 'error-handling.rcase',
        targetName: 'error-handling.rcase'
      }
    ];

    const selected = await vscode.window.showQuickPick(choices, {
      placeHolder: 'Select a RouteCase example template to create in your workspace'
    });

    if (!selected) {
      return;
    }

    const targetPath = path.join(workspaceFolders[0].uri.fsPath, selected.targetName);
    if (fs.existsSync(targetPath)) {
      vscode.window.showWarningMessage(`"${selected.targetName}" already exists in workspace root.`);
      const doc = await vscode.workspace.openTextDocument(targetPath);
      await vscode.window.showTextDocument(doc);
      return;
    }

    const bundledExamplePath = context.asAbsolutePath(path.join('examples', selected.file));
    let content: string;
    if (fs.existsSync(bundledExamplePath)) {
      content = fs.readFileSync(bundledExamplePath, 'utf8');
    } else {
      content = JSON.stringify(
        {
          $schema: 'https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json',
          name: 'RouteCase Quick Start Suite',
          baseUrl: 'http://localhost:3000',
          tests: [
            {
              name: 'Sample Endpoint',
              method: 'GET',
              path: '/api/items/{id}',
              success: [{ name: 'Valid Item', params: { id: 1 }, expect: { status: 200 } }]
            }
          ]
        },
        null,
        2
      );
    }

    fs.writeFileSync(targetPath, content, 'utf8');
    const doc = await vscode.workspace.openTextDocument(targetPath);
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(`Created "${selected.targetName}" example test file.`);
  });

  // 8. Open Results Panel
  const openPanelCmd = vscode.commands.registerCommand('routecase.openResultsPanel', (caseId?: string) => {
    RouteCaseResultsPanel.createOrShow(context.extensionUri, lastSuiteResult, caseId);
  });

  // 9. Rerun Case
  const rerunCaseCmd = vscode.commands.registerCommand('routecase.rerunCase', async (caseId?: string) => {
    vscode.window.showInformationMessage(`Rerunning test case ${caseId ?? ''}...`);
    const activeUri = getActiveRCaseUri();
    if (activeUri) {
      await executeFile(activeUri, context);
    }
  });

  // 10. Copy as cURL command (Feature 2)
  const copyAsCurlCmd = vscode.commands.registerCommand('routecase.copyAsCurl', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Please open a .rcase file to copy a cURL command.');
      return;
    }

    const documentText = editor.document.getText();
    const parseResult = parseRCase(documentText);
    if (!parseResult.valid || !parseResult.document) {
      vscode.window.showErrorMessage('Cannot generate cURL: Current .rcase file has validation errors.');
      return;
    }

    const doc = parseResult.document;
    const cursorLine = editor.selection.active.line;
    const locations = findCodeLensLocations(documentText);
    const caseLocations = locations.filter(l => l.type === 'case' && l.endpointName && l.caseName);

    if (caseLocations.length === 0) {
      vscode.window.showWarningMessage('No test cases found in this file.');
      return;
    }

    // Find nearest case to cursor
    let nearestLoc = caseLocations[0];
    let minDistance = Math.abs(caseLocations[0].line - cursorLine);
    for (const loc of caseLocations) {
      const dist = Math.abs(loc.line - cursorLine);
      if (dist < minDistance) {
        minDistance = dist;
        nearestLoc = loc;
      }
    }

    const targetEndpoint = doc.tests.find(e => e.name === nearestLoc.endpointName);
    if (!targetEndpoint) {
      vscode.window.showWarningMessage(`Could not find endpoint "${nearestLoc.endpointName}".`);
      return;
    }

    const allCases = [...(targetEndpoint.success || []), ...(targetEndpoint.errors || [])];
    const targetCase = allCases.find(c => c.name === nearestLoc.caseName);
    if (!targetCase) {
      vscode.window.showWarningMessage(`Could not find test case "${nearestLoc.caseName}".`);
      return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspacePath = workspaceFolders && workspaceFolders.length > 0
      ? workspaceFolders[0].uri.fsPath
      : path.dirname(editor.document.fileName);
    const config = vscode.workspace.getConfiguration('routecase');
    const envSettings = config.get<Record<string, string>>('env', {});
    const env = loadEnvironment(workspacePath, envSettings);

    const curlString = buildCurlCommand(doc, targetEndpoint, targetCase, env);
    await vscode.env.clipboard.writeText(curlString);
    vscode.window.showInformationMessage('cURL command copied to clipboard!');
  });

  // 11. Import OpenAPI / Swagger (Feature 5)
  const importOpenApiCmd = vscode.commands.registerCommand('routecase.importOpenAPI', async () => {
    const choice = await vscode.window.showQuickPick(
      [
        {
          label: '$(file) Import from local JSON file',
          description: 'Select an OpenAPI 3.x or Swagger 2.x JSON file',
          action: 'file'
        },
        {
          label: '$(globe) Import from URL',
          description: 'Provide an HTTP/HTTPS URL returning OpenAPI JSON',
          action: 'url'
        }
      ],
      { placeHolder: 'Select how you want to import OpenAPI / Swagger specification' }
    );

    if (!choice) {
      return;
    }

    let jsonContent: string | undefined;

    if (choice.action === 'file') {
      const uris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
          'OpenAPI JSON': ['json'],
          'All Files': ['*']
        },
        openLabel: 'Import OpenAPI Spec'
      });

      if (!uris || uris.length === 0) {
        return;
      }

      const filePath = uris[0].fsPath;
      if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        vscode.window.showWarningMessage('Please convert your YAML spec to JSON first (e.g. using https://www.json2yaml.com/)');
        return;
      }

      try {
        jsonContent = fs.readFileSync(filePath, 'utf8');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Failed to read file: ${msg}`);
        return;
      }
    } else {
      const inputUrl = await vscode.window.showInputBox({
        prompt: 'Enter OpenAPI / Swagger JSON URL',
        placeHolder: 'https://petstore.swagger.io/v2/swagger.json'
      });

      if (!inputUrl) {
        return;
      }

      if (inputUrl.endsWith('.yaml') || inputUrl.endsWith('.yml')) {
        vscode.window.showWarningMessage('Please convert your YAML spec to JSON first (e.g. using https://www.json2yaml.com/)');
        return;
      }

      try {
        jsonContent = await fetchHttpContent(inputUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Failed to fetch OpenAPI spec from URL: ${msg}`);
        return;
      }
    }

    if (!jsonContent) {
      return;
    }

    let parsedSpec: unknown;
    try {
      parsedSpec = JSON.parse(jsonContent);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Failed to parse OpenAPI JSON: ${msg}`);
      return;
    }

    try {
      const rcaseDoc = convertOpenApiToRCase(parsedSpec);
      const formattedJson = JSON.stringify(rcaseDoc, null, 2);

      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        const sanitizedTitle = (rcaseDoc.name || 'openapi')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'imported-api';
        const targetFileName = `${sanitizedTitle}.rcase`;
        const targetPath = path.join(workspaceFolders[0].uri.fsPath, targetFileName);

        fs.writeFileSync(targetPath, formattedJson, 'utf8');
        const doc = await vscode.workspace.openTextDocument(targetPath);
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage(`Successfully imported "${rcaseDoc.name}" into ${targetFileName}!`);
      } else {
        const doc = await vscode.workspace.openTextDocument({
          content: formattedJson,
          language: 'routecase'
        });
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage(`Successfully imported "${rcaseDoc.name}"!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Failed to import OpenAPI spec: ${msg}`);
    }
  });

  context.subscriptions.push(
    runCurrentFileCmd,
    runAllCmd,
    runSingleCaseCmd,
    runEndpointCmd,
    stopRunCmd,
    validateCmd,
    createExampleCmd,
    openPanelCmd,
    rerunCaseCmd,
    copyAsCurlCmd,
    importOpenApiCmd
  );
}

function fetchHttpContent(urlStr: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let url: URL;
    try {
      url = new URL(urlStr);
    } catch {
      return reject(new Error(`Invalid URL: ${urlStr}`));
    }

    const client = url.protocol === 'https:' ? https : http;
    const req = client.get(urlStr, { headers: { Accept: 'application/json, text/plain, */*' } }, res => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHttpContent(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode && res.statusCode >= 400) {
        return reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage || ''}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

async function executeFile(
  fileUri: vscode.Uri,
  context: vscode.ExtensionContext,
  filter?: ExecutionFilter
): Promise<void> {
  const filePath = fileUri.fsPath;
  const fileName = path.basename(filePath);

  let rawContent: string;
  try {
    rawContent = fs.readFileSync(filePath, 'utf8');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`RouteCase: Failed to read "${fileName}": ${msg}`);
    return;
  }

  const parseResult = parseRCase(rawContent);
  if (!parseResult.valid || !parseResult.document) {
    const summary = parseResult.errors.map(e => `[${e.path}] ${e.message}`).join(', ');
    vscode.window.showErrorMessage(`RouteCase validation error in "${fileName}": ${summary}`);
    return;
  }

  const doc = parseResult.document;
  currentExecutor = new TestExecutor();

  const titlePrefix = filter?.caseName
    ? `RouteCase: Executing case "${filter.caseName}"`
    : filter?.endpointName
    ? `RouteCase: Executing endpoint "${filter.endpointName}"`
    : `RouteCase: Executing ${fileName}`;

  statusBarItem.text = `$(sync~spin) Running ${filter?.caseName || fileName}...`;
  statusBarItem.show();

  const config = vscode.workspace.getConfiguration('routecase');
  const timeoutMs = config.get<number>('requestTimeout', 10000);
  const maxResponseSizeBytes = config.get<number>('maxResponseSize', 5242880);
  const followRedirects = config.get<boolean>('followRedirects', false);
  const envSettings = config.get<Record<string, string>>('env', {});

  const workspaceFolders = vscode.workspace.workspaceFolders;
  const workspacePath = workspaceFolders && workspaceFolders.length > 0
    ? workspaceFolders[0].uri.fsPath
    : path.dirname(filePath);

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: titlePrefix,
        cancellable: true
      },
      async (progress, token) => {
        token.onCancellationRequested(() => {
          currentExecutor?.cancel();
        });

        const suiteResult = await currentExecutor!.executeSuite(doc, filePath, {
          timeoutMs,
          maxResponseSizeBytes,
          followRedirects,
          filter,
          workspacePath,
          env: envSettings,
          onCaseStart: tc => {
            progress.report({ message: `${tc.endpointName} -> ${tc.caseName}` });
            treeProvider.setCaseRunning(tc.id, tc.endpointName, tc.caseName);
          },
          onCaseComplete: result => {
            RouteCaseCodeLensProvider.recordResult(filePath, result);
            codeLensProvider.refresh();
          }
        });

        lastSuiteResult = suiteResult;
        treeProvider.setSuiteResult(suiteResult);
        codeLensProvider.refresh();

        // Update webview if open
        if (RouteCaseResultsPanel.currentPanel) {
          RouteCaseResultsPanel.currentPanel.updateResults(suiteResult);
        }

        if (suiteResult.failedCount === 0 && suiteResult.errorCount === 0) {
          statusBarItem.text = `$(check) RouteCase: ${suiteResult.passedCount}/${suiteResult.totalCount} Passed`;
          const msg = filter?.caseName
            ? `RouteCase: "${filter.caseName}" passed in ${suiteResult.durationMs}ms!`
            : `RouteCase: All ${suiteResult.totalCount} tests passed in ${suiteResult.durationMs}ms!`;
          vscode.window.showInformationMessage(msg);
        } else {
          statusBarItem.text = `$(error) RouteCase: ${suiteResult.failedCount} Failed, ${suiteResult.errorCount} Errors`;
          const action = await vscode.window.showWarningMessage(
            `RouteCase: ${suiteResult.passedCount} passed, ${suiteResult.failedCount} failed, ${suiteResult.errorCount} errors.`,
            'View Results Panel'
          );
          if (action === 'View Results Panel') {
            RouteCaseResultsPanel.createOrShow(context.extensionUri, suiteResult);
          }
        }
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`RouteCase execution failed: ${msg}`);
    statusBarItem.text = '$(error) RouteCase: Execution Failed';
  } finally {
    currentExecutor = undefined;
  }
}

function getActiveRCaseUri(): vscode.Uri | undefined {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return undefined;
  }
  const ext = path.extname(activeEditor.document.fileName).toLowerCase();
  if (ext === '.rcase' || ext === '.routecase') {
    return activeEditor.document.uri;
  }
  return undefined;
}

export function deactivate() {
  if (currentExecutor) {
    currentExecutor.cancel();
  }
}
