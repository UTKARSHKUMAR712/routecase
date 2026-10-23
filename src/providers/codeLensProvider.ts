import * as vscode from 'vscode';
import { parseRCase } from '../parser/parser';
import { ExecutedTestCase } from '../models/types';
import { findCodeLensLocations } from './codeLensScanner';

export class RouteCaseCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  // Cached results by fileUri + caseId for displaying inline execution badges
  private static resultsCache = new Map<string, ExecutedTestCase>();

  public refresh(): void {
    this._onDidChangeCodeLenses.fire();
  }

  public static recordResult(fileFsPath: string, result: ExecutedTestCase): void {
    const key = `${fileFsPath}::${result.endpointName}::${result.caseName}`;
    this.resultsCache.set(key, result);
  }

  public static clearCache(): void {
    this.resultsCache.clear();
  }

  public provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.CodeLens[] {
    const codeLenses: vscode.CodeLens[] = [];
    const text = document.getText();
    const parseResult = parseRCase(text);

    if (!parseResult.valid || !parseResult.document) {
      return codeLenses;
    }

    const locations = findCodeLensLocations(text);
    const fsPath = document.uri.fsPath;

    for (const loc of locations) {
      const range = new vscode.Range(loc.line, 0, loc.line, 0);

      if (loc.type === 'root') {
        // 1. Run All Tests
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: '▶ Run All Cases',
            tooltip: 'Run every endpoint and test case in this file',
            command: 'routecase.runCurrentFile',
            arguments: [document.uri]
          })
        );

        // 2. Open Results Panel
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: '📊 Results Dashboard',
            tooltip: 'Open the interactive test results panel',
            command: 'routecase.openResultsPanel'
          })
        );
      } else if (loc.type === 'endpoint' && loc.endpointName) {
        const epName = loc.endpointName;
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: `▶ Run Endpoint (${epName})`,
            tooltip: `Run all test cases for endpoint "${epName}"`,
            command: 'routecase.runEndpoint',
            arguments: [document.uri, epName]
          })
        );
      } else if (loc.type === 'case' && loc.endpointName && loc.caseName) {
        const epName = loc.endpointName;
        const cName = loc.caseName;

        // Run Single Case button (Jupyter cell style)
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: `▶ Run Case`,
            tooltip: `Execute test case "${cName}" directly`,
            command: 'routecase.runSingleCase',
            arguments: [document.uri, epName, cName]
          })
        );

        // Check if there is a cached result for this case
        const key = `${fsPath}::${epName}::${cName}`;
        const prev = RouteCaseCodeLensProvider.resultsCache.get(key);
        if (prev) {
          if (prev.status === 'PASS') {
            codeLenses.push(
              new vscode.CodeLens(range, {
                title: `✓ PASS (${prev.actualStatus} • ${prev.durationMs}ms)`,
                tooltip: 'Click to view full test details and response preview',
                command: 'routecase.openResultsPanel',
                arguments: [prev.id]
              })
            );
          } else if (prev.status === 'FAIL') {
            codeLenses.push(
              new vscode.CodeLens(range, {
                title: `✗ FAIL (${prev.actualStatus ?? 'Assertion failed'} • ${prev.durationMs}ms)`,
                tooltip: 'Click to view failure details and assertion diffs',
                command: 'routecase.openResultsPanel',
                arguments: [prev.id]
              })
            );
          } else if (prev.status === 'ERROR') {
            codeLenses.push(
              new vscode.CodeLens(range, {
                title: `⚠ ERROR (${prev.error ?? 'Execution error'})`,
                tooltip: 'Click to view error log',
                command: 'routecase.openResultsPanel',
                arguments: [prev.id]
              })
            );
          }
        }
      }
    }

    return codeLenses;
  }
}
