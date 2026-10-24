# Frequently Asked Questions (FAQ)

Find answers to common questions about RouteCase architecture, privacy, security, and usage.

---

<div v-pre class="rc-faq-container">
  <details class="rc-faq-item" open>
    <summary class="rc-faq-summary">
      <span class="rc-faq-question">Is RouteCase completely free and open-source?</span>
      <span class="rc-faq-badge">Licensing</span>
      <span class="rc-faq-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </span>
    </summary>
    <div class="rc-faq-content">
      <p>Yes! RouteCase is open-source under the permissive <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener">MIT License</a>. You can use it freely for personal projects, commercial applications, and enterprise developer teams without restrictions or paid tier gates.</p>
    </div>
  </details>

  <details class="rc-faq-item">
    <summary class="rc-faq-summary">
      <span class="rc-faq-question">Does RouteCase send my API requests or tokens to the cloud?</span>
      <span class="rc-faq-badge">Privacy & Security</span>
      <span class="rc-faq-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </span>
    </summary>
    <div class="rc-faq-content">
      <p><strong>Never.</strong> RouteCase runs entirely on your local machine inside VS Code. It does not transmit telemetry, analytics, or payload copies to any external server. In addition, sensitive headers (like <code>Authorization</code>, <code>apiKey</code>, and session cookies) are automatically sanitized in logs.</p>
    </div>
  </details>

  <details class="rc-faq-item">
    <summary class="rc-faq-summary">
      <span class="rc-faq-question">How does RouteCase differ from Postman and Insomnia?</span>
      <span class="rc-faq-badge">Comparison</span>
      <span class="rc-faq-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </span>
    </summary>
    <div class="rc-faq-content">
      <p>Postman and Insomnia require separate desktop applications, electron runtimes, cloud workspaces, and forced user logins. RouteCase lives directly inside your VS Code editor, stores test suites in standard Git-versioned <code>.rcase</code> files, runs tests with one-click Jupyter-style CodeLens buttons, and requires zero cloud accounts.</p>
    </div>
  </details>

  <details class="rc-faq-item">
    <summary class="rc-faq-summary">
      <span class="rc-faq-question">How is RouteCase different from the REST Client extension?</span>
      <span class="rc-faq-badge">Comparison</span>
      <span class="rc-faq-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </span>
    </summary>
    <div class="rc-faq-content">
      <p>While REST Client uses plain-text <code>.http</code> files, RouteCase introduces:</p>
      <ul>
        <li>Structured route definitions with automatic separation of <code>success</code> and <code>errors</code> test scenarios.</li>
        <li>Interactive inline CodeLens execution status badges showing latency and status codes directly in the document.</li>
        <li>Multi-level assertions engine supporting deep JSON equality and latency SLA thresholds.</li>
        <li>Native Activity Bar test explorer tree view.</li>
        <li>Automatic variable capture and chaining without requiring JavaScript test scripts.</li>
      </ul>
    </div>
  </details>

  <details class="rc-faq-item">
    <summary class="rc-faq-summary">
      <span class="rc-faq-question">Can I run RouteCase tests in CI/CD pipelines (GitHub Actions)?</span>
      <span class="rc-faq-badge">Automation</span>
      <span class="rc-faq-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </span>
    </summary>
    <div class="rc-faq-content">
      <p>Yes! Because <code>.rcase</code> files are standard structured JSON, you can run them in test suites using Node's native test runner (<code>node --test</code>) or via our runner scripts. A standalone zero-dependency CLI runner package (<code>@routecase/cli</code>) is also planned for future release.</p>
    </div>
  </details>

  <details class="rc-faq-item">
    <summary class="rc-faq-summary">
      <span class="rc-faq-question">How do I report a bug or request a feature?</span>
      <span class="rc-faq-badge">Community</span>
      <span class="rc-faq-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </span>
    </summary>
    <div class="rc-faq-content">
      <p>We welcome bug reports, suggestions, and pull requests! Please open an issue on our official GitHub repository:</p>
      <p><a href="https://github.com/UTKARSHKUMAR712/routecase/issues" target="_blank" rel="noopener">RouteCase Issues on GitHub →</a></p>
    </div>
  </details>
</div>
