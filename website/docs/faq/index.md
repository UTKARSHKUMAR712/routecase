# Frequently Asked Questions (FAQ)

---

### Is RouteCase completely free and open-source?
Yes! RouteCase is open-source under the permissive [MIT License](https://opensource.org/licenses/MIT). You can use it freely in personal projects, commercial software, and enterprise environments.

---

### Does RouteCase send my API requests or tokens to the cloud?
**Never.** RouteCase runs entirely on your local computer inside VS Code. It does not send telemetry, analytics, or payload copies to any external server. Your sensitive tokens and database records never leave your development environment.

---

### How is RouteCase different from the REST Client extension?
REST Client uses RFC 2616 plain-text `.http` files. While lightweight, it lacks:
- Automatic partitioning of multiple `success` and `errors` scenarios for a single route.
- Interactive inline CodeLens status badges showing latency and status codes.
- Structured assertions engine supporting deep JSON equality and latency thresholds.
- Native Activity Bar explorer tree view.

---

### Can I run RouteCase tests in CI/CD pipelines (GitHub Actions)?
Yes! In `v0.2.0`, you can run your test suites using Node's test runner, or run the test runner script against your `.rcase` files. A standalone standalone CLI package (`@routecase/cli`) is on our product roadmap.

---

### How do I report a bug or request a feature?
Please open an issue on our official GitHub repository:
[RouteCase Issues on GitHub](https://github.com/UTKARSHKUMAR712/routecase/issues)
