# Settings & Configuration Reference

RouteCase allows you to customize request timeouts, response size limits, redirect behavior, and default environment variables through standard VS Code settings.

---

## Configuration Properties

You can configure these settings globally in **User Settings** or per repository in `.vscode/settings.json`.

```json
{
  "routecase.requestTimeout": 15000,
  "routecase.maxResponseSize": 10485760,
  "routecase.followRedirects": true,
  "routecase.env": {
    "API_BASE_URL": "http://localhost:3000",
    "API_KEY": "dev-secret-key"
  }
}
```

---

## Settings Details

### `routecase.requestTimeout`
- **Type:** `number` (milliseconds)
- **Default:** `10000` (10 seconds)
- **Description:** Maximum time allowed for an individual HTTP request to complete before RouteCase aborts the socket connection and marks the test as `ERROR (Timeout)`.

### `routecase.maxResponseSize`
- **Type:** `number` (bytes)
- **Default:** `5242880` (5 MB)
- **Description:** Safety threshold on maximum response payload size. Prevents VS Code memory crashes when endpoints accidentally stream massive files or binary dumps.

### `routecase.followRedirects`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Whether RouteCase automatically follows HTTP `301`, `302`, `307`, and `308` redirects. By default, redirects are **not** followed to allow testing redirect responses, status codes, and `Location` headers explicitly.

### `routecase.env`
- **Type:** `object` (`Record<string, string>`)
- **Default:** `{}`
- **Description:** Key-value pairs for environment variable substitution. Merged with variables loaded from `.rcase.env` and `.rcase.env.json`.
