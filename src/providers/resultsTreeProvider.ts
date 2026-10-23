import * as vscode from 'vscode';
import { ExecutedTestCase, TestSuiteResult } from '../models/types';

export type TreeItemType = 'summary' | 'endpoint' | 'case';

export class RouteCaseTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly itemType: TreeItemType,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly payload?: {
      endpointName?: string;
      testCase?: ExecutedTestCase;
      suiteResult?: TestSuiteResult;
    }
  ) {
    super(label, collapsibleState);
    this.contextValue = itemType === 'case' ? 'testCase' : itemType;

    if (itemType === 'case' && payload?.testCase) {
      const tc = payload.testCase;
      this.description = `${tc.actualStatus ?? ''} (${tc.durationMs}ms)`;
      this.tooltip = new vscode.MarkdownString(
        `### ${tc.caseName}\n` +
        `* **Status:** ${tc.status}\n` +
        `* **Method:** ${tc.method}\n` +
        `* **URL:** \`${tc.url}\`\n` +
        `* **Duration:** ${tc.durationMs}ms\n` +
        (tc.error ? `* **Error:** ${tc.error}\n` : '')
      );

      switch (tc.status) {
        case 'PASS':
          this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
          break;
        case 'FAIL':
          this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
          break;
        case 'ERROR':
          this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconErrored'));
          break;
        case 'RUNNING':
          this.iconPath = new vscode.ThemeIcon('sync~spin', new vscode.ThemeColor('testing.iconQueued'));
          break;
        case 'CANCELLED':
          this.iconPath = new vscode.ThemeIcon('circle-slash', new vscode.ThemeColor('testing.iconSkipped'));
          break;
        default:
          this.iconPath = new vscode.ThemeIcon('circle-outline');
      }

      this.command = {
        command: 'routecase.openResultsPanel',
        title: 'View Test Details',
        arguments: [tc.id]
      };
    } else if (itemType === 'summary' && payload?.suiteResult) {
      const s = payload.suiteResult;
      this.description = `${s.passedCount}/${s.totalCount} passed (${s.durationMs}ms)`;
      this.iconPath = s.failedCount === 0 && s.errorCount === 0
        ? new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'))
        : new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
    } else if (itemType === 'endpoint') {
      this.iconPath = new vscode.ThemeIcon('symbol-interface');
    }
  }
}

export class RouteCaseTreeProvider implements vscode.TreeDataProvider<RouteCaseTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<RouteCaseTreeItem | undefined | null | void> =
    new vscode.EventEmitter<RouteCaseTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<RouteCaseTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private currentSuiteResult?: TestSuiteResult;
  private runningCases: Map<string, { endpointName: string; caseName: string }> = new Map();

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public setSuiteResult(suite: TestSuiteResult): void {
    this.currentSuiteResult = suite;
    this.runningCases.clear();
    this.refresh();
  }

  public setCaseRunning(id: string, endpointName: string, caseName: string): void {
    this.runningCases.set(id, { endpointName, caseName });
    this.refresh();
  }

  public clear(): void {
    this.currentSuiteResult = undefined;
    this.runningCases.clear();
    this.refresh();
  }

  public getTreeItem(element: RouteCaseTreeItem): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: RouteCaseTreeItem): Thenable<RouteCaseTreeItem[]> {
    if (!this.currentSuiteResult) {
      if (this.runningCases.size > 0) {
        return Promise.resolve([
          new RouteCaseTreeItem('Running tests...', 'summary', vscode.TreeItemCollapsibleState.None)
        ]);
      }
      return Promise.resolve([
        new RouteCaseTreeItem('No tests run yet. Run a .rcase file to view results.', 'summary', vscode.TreeItemCollapsibleState.None)
      ]);
    }

    const suite = this.currentSuiteResult;

    // Root level: Summary item + Endpoint items
    if (!element) {
      const items: RouteCaseTreeItem[] = [];

      // 1. Summary item
      items.push(
        new RouteCaseTreeItem(
          `${suite.suiteName}`,
          'summary',
          vscode.TreeItemCollapsibleState.None,
          { suiteResult: suite }
        )
      );

      // Group by endpoint name
      const endpointNames = Array.from(new Set(suite.results.map(r => r.endpointName)));
      for (const epName of endpointNames) {
        const casesForEp = suite.results.filter(r => r.endpointName === epName);
        const epMethod = casesForEp[0]?.method || 'GET';
        const hasFailures = casesForEp.some(c => c.status === 'FAIL' || c.status === 'ERROR');

        const epItem = new RouteCaseTreeItem(
          `[${epMethod}] ${epName}`,
          'endpoint',
          vscode.TreeItemCollapsibleState.Expanded,
          { endpointName: epName }
        );
        epItem.description = `${casesForEp.filter(c => c.status === 'PASS').length}/${casesForEp.length} passed`;
        epItem.iconPath = hasFailures
          ? new vscode.ThemeIcon('close', new vscode.ThemeColor('testing.iconFailed'))
          : new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));

        items.push(epItem);
      }

      return Promise.resolve(items);
    }

    // Children of an endpoint
    if (element.itemType === 'endpoint' && element.payload?.endpointName) {
      const epName = element.payload.endpointName;
      const casesForEp = suite.results.filter(r => r.endpointName === epName);

      const caseItems = casesForEp.map(tc => {
        return new RouteCaseTreeItem(
          tc.caseName,
          'case',
          vscode.TreeItemCollapsibleState.None,
          { testCase: tc, endpointName: epName }
        );
      });

      return Promise.resolve(caseItems);
    }

    return Promise.resolve([]);
  }
}
