<div v-pre>

# Variables Overview & Resolution Order

RouteCase features a multi-tiered variable system supporting environment variables, chained response values, and dynamic test data generators.

---

## Variable Syntax

RouteCase uses curly brace syntax:

- **Double Curly Braces `{{VARIABLE}}`**: Replaced by RouteCase's variable expansion engine (environment variables, captured values, or dynamic generators).
- **Single Curly Braces `{id}`**: Used exclusively in endpoint `path` templates to define path parameter placeholders (substituted from `params: { "id": "val" }`).

---

## Resolution Order & Precedence

When evaluating a `{{...}}` variable expression, RouteCase resolves values in strict order:

```text
 ┌────────────────────────────────────────────────────────┐
 │ 1. Captured Variables from earlier test cases (capture)│  Highest Precedence
 ├────────────────────────────────────────────────────────┤
 │ 2. Environment Variables (.rcase.env, .rcase.env.json) │
 ├────────────────────────────────────────────────────────┤
 │ 3. VS Code Settings (routecase.env)                    │
 ├────────────────────────────────────────────────────────┤
 │ 4. Dynamic Built-in Generators ({{$uuid}}, {{$isoDate}})│ Lowest Precedence
 └────────────────────────────────────────────────────────┘
```

1. **Captured Variables (`capture`):** If an earlier test case extracted a token named `authToken`, `{{authToken}}` will take top priority.
2. **Environment Files (`.rcase.env` / `.rcase.env.json`):** Workspace environment files are evaluated next.
3. **VS Code Settings (`routecase.env`):** Configuration defined in workspace settings.
4. **Dynamic Generators (`{{$...}}`):** Variables beginning with a dollar sign `$` are evaluated by the built-in generator engine.

---

## Where Variables Can Be Used

Variables can be placed in any of the following fields:
- Root `baseUrl`
- Root, endpoint, and case `headers`
- Path template `params`
- URL `query` parameters
- Request `body` (inside string values, object keys, or nested arrays)

</div>
