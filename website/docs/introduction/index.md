# Introduction to RouteCase

**RouteCase** is a lightweight, zero-configuration API testing extension built specifically for Visual Studio Code. It allows developers to define HTTP endpoints and test cases in declarative `.rcase` JSON documents, execute requests directly inside the editor with one click, and inspect results without leaving their coding flow.

---

## The Problem RouteCase Solves

Traditional API testing tools force developers into one of two extremes:

1. **Heavy External Desktop Clients (e.g. Postman, Insomnia):**
   - High memory footprint and slow startup times.
   - Separate windows that break editor focus.
   - Forced cloud accounts, team limits, and telemetry.
   - Proprietary collection formats that don't diff cleanly in Git pull requests.

2. **Basic `.http` or cURL Files:**
   - Difficult to run structured assertions on response payloads.
   - No built-in expansion of multiple success and error scenarios for a single route.
   - Manual copying and pasting of authentication tokens across requests.
   - Lack of deep JSON comparison and automated latency benchmarks.

**RouteCase bridges this gap.** It gives you the speed and cleanliness of local Git-committed JSON files combined with the rich testing capabilities of full test runners.

---

## Core Capabilities at a Glance

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              RouteCase                                 │
 ├────────────────────┬───────────────────────┬───────────────────────────┤
 │  Authoring         │  Execution            │  Validation               │
 │  • Declarative     │  • Jupyter CodeLens   │  • HTTP Status Codes      │
 │    .rcase JSON     │  • Sequential Runner  │  • Substring Matching     │
 │  • Environment     │  • Isolated Cases     │  • Deep JSON Equality     │
 │    Variables       │  • Tree View Explorer │  • Header Presence        │
 │  • Dynamic Vars    │  • Response Chaining  │  • Max Duration (ms) SLA  │
 └────────────────────┴───────────────────────┴───────────────────────────┘
```

- **Declarative `.rcase` Documents:** One endpoint can define multiple `success` cases (valid inputs, different roles) and multiple `errors` cases (invalid IDs, missing fields, unauthorized tokens).
- **Inline Cell Actions (Jupyter-Style):** Click `▶ Run Case` above any individual scenario to run it in isolation, with instant visual feedback badges (`✓ PASS 200 • 35ms`).
- **Response Variable Chaining:** Automatically capture values from responses (e.g. JWT access tokens or newly created entity IDs) and inject them into subsequent test requests.
- **Environment Profiles:** Seamlessly switch between `local`, `staging`, and `production` environments using `.rcase.env` files without altering test files.
- **Dynamic Data Generators:** Generate random UUIDs (`{{$uuid}}`), timestamps (`{{$timestamp}}`), emails (`{{$randomEmail}}`), and dates on the fly.
- **Security-First Design:** Headers containing credentials (`Authorization`, `Cookie`, `x-api-key`) are automatically redacted in test reports and UI views.
- **OpenAPI & Swagger Importer:** Instantly scaffold test suites from existing OpenAPI 3.x and Swagger 2.x specifications.

---

## Supported Environments & Requirements

- **Visual Studio Code:** Version `1.90.0` or higher.
- **Operating Systems:** Windows 10/11, macOS (Intel & Apple Silicon), Linux (Ubuntu, Debian, Fedora, Arch).
- **Network Access:** Any local HTTP/HTTPS server (`localhost:3000`, `127.0.0.1:8080`), local network services, or internet-accessible APIs.
- **Runtime Dependencies:** Zero external runtime dependencies. Node.js built-ins power the entire execution engine.
