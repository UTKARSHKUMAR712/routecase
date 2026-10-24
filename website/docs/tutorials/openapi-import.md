# Tutorial: OpenAPI / Swagger Importer

Instead of writing test definitions by hand, RouteCase can convert any OpenAPI 3.x or Swagger 2.x specification into an executable `.rcase` suite in seconds.

---

## How It Works

RouteCase includes a zero-dependency specification parser (`src/importer/openApiImporter.ts`) that extracts:

1. **Title & Base URL:** Derived from `info.title` and `servers[0].url` (or `host` + `basePath` in Swagger 2.0).
2. **Endpoints:** Each path + HTTP method combination becomes an `EndpointDefinition`.
3. **Parameters:**
   - Path parameters (`in: path`) populate `params` with example values or types.
   - Query parameters (`in: query`) populate `query`.
4. **Request Bodies:** Extracted from `requestBody.content['application/json'].schema.example` or sample objects.
5. **Starter Assertions:** Generates a `success` case asserting status `200` (or `201`) and an `errors` case asserting `400` or `422`.

---

## Step-by-Step Instructions

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Run:
   ```text
   RouteCase: Import OpenAPI / Swagger
   ```
3. Choose an input method:
   - **Local File:** Pick a `swagger.json` or `openapi.json` file on your disk.
   - **Remote URL:** Enter a live specification URL (e.g. `http://localhost:3000/api-json` or `https://petstore.swagger.io/v2/swagger.json`).
4. RouteCase generates `api.rcase` in your workspace root and opens it immediately.
5. Click **`▶ Run All Cases`** to begin testing your routes right away!

::: tip Converting YAML Specs
RouteCase currently parses JSON specifications natively. If your specification is in YAML (`openapi.yaml`), convert it to JSON using an online tool like [json2yaml.com](https://www.json2yaml.com/) or via CLI (`npx yamljs input.yaml > openapi.json`) before importing.
:::
