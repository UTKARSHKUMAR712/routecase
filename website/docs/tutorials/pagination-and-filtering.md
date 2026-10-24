# Tutorial: Pagination & Query Filtering

Testing collection endpoints with pagination, query filtering, and sorting parameters is a frequent requirement. Here is how to test pagination robustly in RouteCase.

---

## Example: Products Catalog

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "Products Catalog Pagination Suite",
  "baseUrl": "https://api.shop.local:8080",
  "tests": [
    {
      "name": "Search & Paginate Products",
      "method": "GET",
      "path": "/api/products?category={category}",
      "success": [
        {
          "name": "First page of electronics",
          "params": {
            "category": "Electronics & Audio"
          },
          "query": {
            "page": 1,
            "limit": 10,
            "sort": "price",
            "order": "asc"
          },
          "expect": {
            "status": 200,
            "bodyContains": "items",
            "maxDurationMs": 400
          }
        },
        {
          "name": "Second page with 20 items",
          "params": {
            "category": "Electronics & Audio"
          },
          "query": {
            "page": 2,
            "limit": 20
          },
          "expect": {
            "status": 200
          }
        }
      ],
      "errors": [
        {
          "name": "Negative page returns 400",
          "params": {
            "category": "Electronics"
          },
          "query": {
            "page": -1,
            "limit": 10
          },
          "expect": {
            "status": 400,
            "bodyContains": "page must be positive integer"
          }
        },
        {
          "name": "Excessive page limit rejected",
          "params": {
            "category": "Electronics"
          },
          "query": {
            "page": 1,
            "limit": 50000
          },
          "expect": {
            "status": 422,
            "bodyContains": "Limit cannot exceed 100"
          }
        }
      ]
    }
  ]
}
```

Notice how `category={category}` handles spaces and the ampersand `&` safely, while the additional pagination keys (`page`, `limit`, `sort`, `order`) are cleanly appended to the query string.
