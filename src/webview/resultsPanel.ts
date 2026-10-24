import * as vscode from 'vscode';
import { TestSuiteResult } from '../models/types';
import { escapeHtml } from './escape';

export class RouteCaseResultsPanel {
  public static currentPanel: RouteCaseResultsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _currentSuite?: TestSuiteResult;
  private _focusedCaseId?: string;

  public static createOrShow(
    extensionUri: vscode.Uri,
    suite?: TestSuiteResult,
    focusedCaseId?: string
  ): RouteCaseResultsPanel {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;

    if (RouteCaseResultsPanel.currentPanel) {
      RouteCaseResultsPanel.currentPanel._panel.reveal(column);
      if (suite) {
        RouteCaseResultsPanel.currentPanel.updateResults(suite, focusedCaseId);
      }
      return RouteCaseResultsPanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      'routecase.results',
      'RouteCase Results',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri]
      }
    );

    RouteCaseResultsPanel.currentPanel = new RouteCaseResultsPanel(panel, extensionUri, suite, focusedCaseId);
    return RouteCaseResultsPanel.currentPanel;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    suite?: TestSuiteResult,
    focusedCaseId?: string
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._currentSuite = suite;
    this._focusedCaseId = focusedCaseId;

    this._panel.iconPath = {
      light: vscode.Uri.joinPath(this._extensionUri, 'resources', 'activity-icon.svg'),
      dark: vscode.Uri.joinPath(this._extensionUri, 'resources', 'activity-icon.svg')
    };

    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'rerunAll':
            vscode.commands.executeCommand('routecase.runCurrentFile');
            break;
          case 'stopRun':
            vscode.commands.executeCommand('routecase.stopRun');
            break;
          case 'rerunCase':
            vscode.commands.executeCommand('routecase.rerunCase', message.caseId);
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public updateResults(suite: TestSuiteResult, focusedCaseId?: string): void {
    this._currentSuite = suite;
    if (focusedCaseId) {
      this._focusedCaseId = focusedCaseId;
    }
    this._update();
  }

  public dispose(): void {
    RouteCaseResultsPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update(): void {
    this._panel.title = this._currentSuite
      ? `Results: ${this._currentSuite.suiteName}`
      : 'RouteCase Results';
    this._panel.webview.html = this._getHtmlForWebview();
  }

  private _getHtmlForWebview(): string {
    const suite = this._currentSuite;

    if (!suite) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RouteCase Results</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      padding: 30px;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      text-align: center;
    }
    .empty-state {
      max-width: 500px;
      margin: 60px auto;
      padding: 30px;
      border: 1px dashed var(--vscode-panel-border);
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="empty-state">
    <h2>No Test Results Yet</h2>
    <p>Open a <code>.rcase</code> or <code>.routecase</code> test file and click <strong>Run Tests in Current File</strong> to view live execution results and assertions.</p>
  </div>
</body>
</html>`;
    }

    const passRate = suite.totalCount > 0 ? Math.round((suite.passedCount / suite.totalCount) * 100) : 0;

    const caseCardsHtml = suite.results.map((r, index) => {
      const isFocused = r.id === this._focusedCaseId;
      const statusClass = r.status.toLowerCase();

      const assertionsList = r.assertions.map(a => {
        const icon = a.passed ? '✓' : '✗';
        const color = a.passed ? 'var(--vscode-testing-iconPassed, #4ec9b0)' : 'var(--vscode-testing-iconFailed, #f14c4c)';
        return `
          <div class="assertion-row" style="color: ${color};">
            <span class="assert-icon">${icon}</span>
            <span class="assert-msg">${escapeHtml(a.message)}</span>
          </div>`;
      }).join('');

      return `
      <div class="case-card ${statusClass} ${isFocused ? 'focused' : ''}" id="case-${index}">
        <div class="case-header" onclick="toggleDetails(${index})">
          <div class="case-title-group">
            <span class="status-badge ${statusClass}">${escapeHtml(r.status)}</span>
            <span class="http-badge ${escapeHtml(r.method.toLowerCase())}">${escapeHtml(r.method)}</span>
            <span class="case-name">${escapeHtml(r.caseName)}</span>
            <span class="endpoint-name">(${escapeHtml(r.endpointName)})</span>
          </div>
          <div class="case-meta">
            <span class="http-status">${r.actualStatus ? `Status: ${r.actualStatus}` : ''}</span>
            <span class="duration">${r.durationMs}ms</span>
            <span class="expand-icon" id="icon-${index}">▼</span>
          </div>
        </div>

        <div class="case-details" id="details-${index}" style="display: ${isFocused ? 'block' : 'none'};">
          <div class="detail-row">
            <strong>Target URL:</strong> <code>${escapeHtml(r.url)}</code>
          </div>

          ${r.error ? `
          <div class="error-box">
            <strong>Execution Error:</strong>
            <pre>${escapeHtml(r.error)}</pre>
          </div>` : ''}

          ${r.captured && Object.keys(r.captured).length > 0 ? `
          <div class="section-title">📋 Captured Variables</div>
          <div class="captured-variables" style="padding: 6px 12px; background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 4px; font-family: monospace;">
            ${Object.entries(r.captured).map(([k, v]) => `<div><strong>${escapeHtml(k)}</strong> = <code>${escapeHtml(v)}</code></div>`).join('')}
          </div>` : ''}

          <div class="section-title">Assertions</div>
          <div class="assertions-container">
            ${assertionsList.length > 0 ? assertionsList : '<div class="muted">No assertions configured</div>'}
          </div>

          <div class="section-title">Request Headers (Redacted)</div>
          <pre class="code-block">${escapeHtml(JSON.stringify(r.redactedHeaders, null, 2))}</pre>

          ${r.requestBody !== undefined ? `
          <div class="section-title">Request Body</div>
          <pre class="code-block">${escapeHtml(typeof r.requestBody === 'string' ? r.requestBody : JSON.stringify(r.requestBody, null, 2))}</pre>
          ` : ''}

          ${r.actualHeaders ? `
          <div class="section-title">Response Headers</div>
          <pre class="code-block">${escapeHtml(JSON.stringify(r.actualHeaders, null, 2))}</pre>
          ` : ''}

          ${r.actualBody ? `
          <div class="section-title">Response Body Preview</div>
          <pre class="code-block">${escapeHtml(r.actualBody)}</pre>
          ` : ''}
        </div>
      </div>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>RouteCase Results</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      margin: 0;
      padding: 20px;
      line-height: 1.5;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .header-title {
      font-size: 1.4em;
      font-weight: 600;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--vscode-editor-inactiveSelectionBackground);
      padding: 12px 16px;
      border-radius: 6px;
      border: 1px solid var(--vscode-panel-border);
    }
    .stat-num {
      font-size: 1.8em;
      font-weight: 700;
      margin-top: 4px;
    }
    .stat-num.passed { color: var(--vscode-testing-iconPassed, #4ec9b0); }
    .stat-num.failed { color: var(--vscode-testing-iconFailed, #f14c4c); }
    .stat-num.error { color: var(--vscode-testing-iconErrored, #cca700); }
    .btn {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn:hover { background: var(--vscode-button-hoverBackground); }
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .case-card {
      background: var(--vscode-editor-inactiveSelectionBackground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      margin-bottom: 12px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .case-card.focused {
      border-color: var(--vscode-focusBorder);
    }
    .case-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      cursor: pointer;
      user-select: none;
    }
    .case-header:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .case-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status-badge {
      font-size: 0.75em;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .status-badge.pass {
      background: var(--vscode-testing-iconPassed, #4ec9b0);
      color: #1e1e1e;
    }
    .status-badge.fail {
      background: var(--vscode-testing-iconFailed, #f14c4c);
      color: #fff;
    }
    .status-badge.error, .status-badge.cancelled {
      background: var(--vscode-testing-iconErrored, #cca700);
      color: #1e1e1e;
    }
    .http-badge {
      font-size: 0.8em;
      font-weight: bold;
      padding: 1px 6px;
      border-radius: 3px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
    }
    .case-name {
      font-weight: 600;
    }
    .endpoint-name {
      opacity: 0.7;
      font-size: 0.9em;
    }
    .case-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.9em;
      opacity: 0.85;
    }
    .case-details {
      padding: 16px;
      background: var(--vscode-editor-background);
      border-top: 1px solid var(--vscode-panel-border);
    }
    .detail-row {
      margin-bottom: 8px;
    }
    .section-title {
      font-weight: 600;
      font-size: 0.95em;
      margin-top: 14px;
      margin-bottom: 6px;
      opacity: 0.9;
    }
    .code-block {
      background: var(--vscode-textCodeBlock-background);
      padding: 8px 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: var(--vscode-editor-font-family);
      font-size: 0.9em;
      margin: 4px 0 10px 0;
      border: 1px solid var(--vscode-panel-border);
    }
    .error-box {
      background: rgba(241, 76, 76, 0.1);
      border-left: 4px solid var(--vscode-testing-iconFailed, #f14c4c);
      padding: 10px 14px;
      border-radius: 4px;
      margin: 10px 0;
    }
    .assertion-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      font-weight: 500;
    }
    .progress-bar-container {
      width: 100%;
      height: 6px;
      background: var(--vscode-panel-border);
      border-radius: 3px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: var(--vscode-testing-iconPassed, #4ec9b0);
      width: ${passRate}%;
      transition: width 0.3s;
    }
    .filter-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .filter-btn {
      background: transparent;
      border: 1px solid var(--vscode-panel-border);
      color: var(--vscode-foreground);
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85em;
    }
    .filter-btn.active {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border-color: var(--vscode-button-background);
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="header-title">${escapeHtml(suite.suiteName)}</div>
      <div style="opacity: 0.7; font-size: 0.9em;">File: <code>${escapeHtml(suite.filePath)}</code></div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn" onclick="rerunSuite()">▶ Rerun All</button>
    </div>
  </div>

  <div class="progress-bar-container">
    <div class="progress-bar"></div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div>Total Cases</div>
      <div class="stat-num">${suite.totalCount}</div>
    </div>
    <div class="stat-card">
      <div>Passed</div>
      <div class="stat-num passed">${suite.passedCount}</div>
    </div>
    <div class="stat-card">
      <div>Failed</div>
      <div class="stat-num failed">${suite.failedCount}</div>
    </div>
    <div class="stat-card">
      <div>Errors</div>
      <div class="stat-num error">${suite.errorCount}</div>
    </div>
    <div class="stat-card">
      <div>Duration</div>
      <div class="stat-num" style="font-size: 1.3em; margin-top: 8px;">${suite.durationMs}ms</div>
    </div>
  </div>

  <div class="filter-bar">
    <button class="filter-btn active" onclick="filterCases('all', this)">All (${suite.totalCount})</button>
    <button class="filter-btn" onclick="filterCases('pass', this)">Passed (${suite.passedCount})</button>
    <button class="filter-btn" onclick="filterCases('fail', this)">Failed (${suite.failedCount})</button>
    <button class="filter-btn" onclick="filterCases('error', this)">Errors (${suite.errorCount})</button>
  </div>

  <div id="casesList">
    ${caseCardsHtml}
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function rerunSuite() {
      vscode.postMessage({ command: 'rerunAll' });
    }

    function toggleDetails(index) {
      const details = document.getElementById('details-' + index);
      const icon = document.getElementById('icon-' + index);
      if (details.style.display === 'none') {
        details.style.display = 'block';
        icon.innerText = '▲';
      } else {
        details.style.display = 'none';
        icon.innerText = '▼';
      }
    }

    function filterCases(filter, btn) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cards = document.querySelectorAll('.case-card');
      cards.forEach(c => {
        if (filter === 'all' || c.classList.contains(filter)) {
          c.style.display = 'block';
        } else {
          c.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
  }
}
