# anera.markets public API examples

This repository contains small, runnable examples for the **anera.markets** public HTTP API: listing models, token factories, and companies, plus daily **revenue** and **token utilisation** rankings by resource type.

The machine-readable contract lives in [`openapi.json`](openapi.json) (OpenAPI 3.1). Use it with codegen tools, Postman, or any OpenAPI-aware client if you prefer not to hand-roll requests.

## Base URL

All paths in the schema are rooted at `/api/v1/public/...`. You must point the examples at the correct **API origin** (scheme + host, optionally port; **no** trailing slash).

Set:

| Variable | Meaning |
| -------- | ------- |
| `ANERA_MARKETS_API_BASE_URL` | Origin only, i.e. `https://api.anera.markets` |

The examples **require** this variable so they never silently call the wrong environment.

## API overview

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/v1/public/models` | All distinct models (`model_slug`, `model_name`) |
| `GET` | `/api/v1/public/token-factories` | All distinct token factories (`provider_slug`, `provider_name`) |
| `GET` | `/api/v1/public/companies` | All distinct companies (`provider`) |
| `GET` | `/api/v1/public/revenue/{resource_type}` | Ranked revenue in USD for one day |
| `GET` | `/api/v1/public/token-utilisation/{resource_type}` | Ranked token usage for one day |

Path parameter **`resource_type`** is one of: `token-factory`, `model`, `company`.

### Query parameters (revenue and token utilisation)

| Parameter | Description |
| --------- | ----------- |
| `timestamp` | Optional. `YYYY-MM-DD` or ISO-8601. If omitted, the API uses the **latest available** day. |
| `resource_id` | Optional. Restrict to a single resource; omit for **all** resources. |

**Token utilisation only:**

| Parameter | Description |
| --------- | ----------- |
| `token_type` | `total` (default), `prompt`, `completion`, or `reasoning`. Relevant for model/company views. |

### Response shapes (summary)

- **Revenue:** `{ resource_type, timestamp, items?: [{ resource_id, revenue_usd }] }`
- **Token utilisation:** `{ resource_type, timestamp, token_type, items?: [{ resource_id, resource_name, token_count, rank }] }`

See `openapi.json` for full schemas and validation rules.

---

## Python

**Requirements:** Python 3.10+ recommended (uses modern typing). Dependencies are listed in [`python/requirements.txt`](python/requirements.txt).

```bash
cd python
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export ANERA_MARKETS_API_BASE_URL='https://api.anera.markets'
python examples.py
```

[`python/examples.py`](python/examples.py) defines small functions—`get_models()`, `get_token_factories()`, `get_companies()`, `get_revenue(...)`, `get_token_utilisation(...)`—that mirror the endpoints. Running the file as a script prints truncated JSON samples for each call so you can verify connectivity quickly.

Import and reuse the functions from your own code, or copy the `_get` pattern if you prefer a single generic helper.

---

## TypeScript (Node.js)

**Requirements:** Node.js **18+** (global `fetch`) and npm. [`typescript/package.json`](typescript/package.json) pins the TypeScript compiler as a dev dependency.

[`typescript/src/types.ts`](typescript/src/types.ts) defines **request** query types (`RevenueQueryParams`, `TokenUtilisationQueryParams`) and **response** types (`ModelItem`, `RevenueResponse`, `TokenUtilisationResponse`, row types, etc.) aligned with [`openapi.json`](openapi.json).

[`typescript/src/examples.ts`](typescript/src/examples.ts) implements typed `fetch` helpers with `Promise<…>` return types and re-exports the public types for convenience.

```bash
cd typescript
npm install
npm run build
export ANERA_MARKETS_API_BASE_URL='https://api.anera.markets'
npm start
# runs: node dist/examples.js
```

In the browser, you can port the same types and adapt the `fetch` calls, subject to **CORS** policy on the API host.

---

## Troubleshooting

- **`ANERA_MARKETS_API_BASE_URL` not set:** Both example entrypoints exit with a short message; export the variable as shown above.
- **HTTP 4xx / 5xx:** The TypeScript example surfaces status and body text in thrown `Error`s. For Python, `requests` raises `HTTPError`; wrap or log `response.text` for details.
- **422 validation:** Path or query values must match the enums in `openapi.json` (for example `resource_type` must be exactly `token-factory`, `model`, or `company`).
