import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { parseRCase } from './parser/parser';
import { TestExecutor } from './engine/executor';
import { RouteCaseTreeProvider } from './providers/resultsTreeProvider';
import { RouteCaseResultsPanel } from './webview/resultsPanel';
import { TestSuiteResult } from './models/types';

let currentExecutor: TestExecutor | undefined;
let statusBarItem: vscode.StatusBarItem;
let treeProvider: RouteCaseTreeProvider;
let lastSuiteResult: TestSuiteResult | undefined;

export function activate(context: vscode.ExtensionContext) {
  treeProvider = new RouteCaseTreeProvider();
  vscode.window.registerTreeDataProvider('routecase.resultsView', treeProvider);

  // Status Bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
  statusBarItem.text = '$(play) RouteCase';
  statusBarItem.tooltip = 'RouteCase: Click to run tests in active file';
  statusBarItem.command = 'routecase.runCurrentFile';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // 1. Run Tests in Current File
  const runCurrentFileCmd = vscode.commands.registerCommand('routecase.runCurrentFile', async (uri?: vscode.Uri) => {
    const targetUri = uri || getActiveRCaseUri();
    if (!targetUri) {
      vscode.window.showWarningMessage('Please open or select a .rcase or .routecase file to run.');
      return;
    }
    await executeFile(targetUri, context);
  });

  // 2. Run All Tests
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

  // 3. Stop Test Run
  const stopRunCmd = vscode.commands.registerCommand('routecase.stopRun', () => {
    if (currentExecutor) {
      currentExecutor.cancel();
      vscode.window.showInformationMessage('RouteCase: Cancelling active test run...');
      statusBarItem.text = '$(debug-stop) RouteCase: Stopped';
    } else {
      vscode.window.showInformationMessage('RouteCase: No active test run to stop.');
    }
  });

  // 4. Validate Current File
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

  // 5. Create Example Test File
  const createExampleCmd = vscode.commands.registerCommand('routecase.createExample', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('Please open a folder or workspace before creating an example test file.');
      return;
    }

    const targetPath = path.join(workspaceFolders[0].uri.fsPath, 'api.rcase');
    if (fs.existsSync(targetPath)) {
      vscode.window.showWarningMessage(`"api.rcase" already exists in workspace root.`);
      const doc = await vscode.workspace.openTextDocument(targetPath);
      await vscode.window.showTextDocument(doc);
      return;
    }

    const exampleContent = JSON.stringify({
      "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
      "name": "Superhero API Test Suite",
      "baseUrl": "http://localhost:3000",
      "tests": [
        {
          "name": "Get superhero by name",
          "method": "GET",
          "path": "/api/info/{name}",
          "success": [
            {
              "name": "Find Batman",
              "params": {
                "name": "Batman"
              },
              "expect": {
                "status": 200,
                "bodyContains": "Batman"
              }
            }
          ],
          "errors": [
            {
              "name": "Unknown superhero",
              "params": {
                "name": "UnknownHero123"
              },
              "expect": {
                "status": 404
              }
            },
            {
              "name": "Invalid name rat",
              "params": {
                "name": "rat"
              },
              "expect": {
                "status": 404
              }
            },
            {
              "name": "Invalid name king",
              "params": {
                "name": "king"
              },
              "expect": {
                "status": 404
              }
            }
          ]
        }
      ]
    }, null, 2);

    fs.writeFileSync(targetPath, exampleContent, 'utf8');
    const doc = await vscode.workspace.openTextDocument(targetPath);
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage('Created "api.rcase" example test file.');
  });

  // 6. Open Results Panel
  const openPanelCmd = vscode.commands.registerCommand('routecase.openResultsPanel', (caseId?: string) => {
    RouteCaseResultsPanel.createOrShow(context.extensionUri, lastSuiteResult, caseId);
  });

  // 7. Rerun Case
  const rerunCaseCmd = vscode.commands.registerCommand('routecase.rerunCase', async (caseId?: string) => {
    vscode.window.showInformationMessage(`Rerunning test case ${caseId ?? ''}...`);
    const activeUri = getActiveRCaseUri();
    if (activeUri) {
      await executeFile(activeUri, context);
    }
  });

  context.subscriptions.push(
    runCurrentFileCmd,
    runAllCmd,
    stopRunCmd,
    validateCmd,
    createExampleCmd,
    openPanelCmd,
    rerunCaseCmd
  );
}

async function executeFile(fileUri: vscode.Uri, context: vscode.ExtensionContext): Promise<void> {
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

  statusBarItem.text = `$(sync~spin) Running ${fileName}...`;
  statusBarItem.show();

  const config = vscode.workspace.getConfiguration('routecase');
  const timeoutMs = config.get<number>('requestTimeout', 10000);
  const maxResponseSizeBytes = config.get<number>('maxResponseSize', 5242880);
  const followRedirects = config.get<boolean>('followRedirects', false);

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `RouteCase: Executing ${fileName}`,
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
          onCaseStart: tc => {
            progress.report({ message: `${tc.endpointName} -> ${tc.caseName}` });
            treeProvider.setCaseRunning(tc.id, tc.endpointName, tc.caseName);
          }
        });

        lastSuiteResult = suiteResult;
        treeProvider.setSuiteResult(suiteResult);

        // Update webview if open
        if (RouteCaseResultsPanel.currentPanel) {
          RouteCaseResultsPanel.currentPanel.updateResults(suiteResult);
        }

        if (suiteResult.failedCount === 0 && suiteResult.errorCount === 0) {
          statusBarItem.text = `$(check) RouteCase: ${suiteResult.passedCount}/${suiteResult.totalCount} Passed`;
          vscode.window.showInformationMessage(
            `RouteCase: All ${suiteResult.totalCount} tests in "${fileName}" passed in ${suiteResult.durationMs}ms!`
          );
        } else {
          statusBarItem.text = `$(error) RouteCase: ${suiteResult.failedCount} Failed, ${suiteResult.errorCount} Errors`;
          const action = await vscode.window.showWarningMessage(
            `RouteCase: ${suiteResult.passedCount} passed, ${suiteResult.failedCount} failed, ${suiteResult.errorCount} errors in "${fileName}".`,
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
