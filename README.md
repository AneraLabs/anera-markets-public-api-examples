# [anera.markets](https://anera.markets) public API examples

This repository contains small, runnable examples for the **anera.markets** public [HTTP API](https://api.anera.markets/docs): listing models, token factories, and companies, plus daily **revenue** and **token utilisation** rankings by resource type.

The machine-readable contract lives in [`openapi.json`](openapi.json) (OpenAPI 3.1). Use it with codegen tools, Postman, or any OpenAPI-aware client if you prefer not to hand-roll requests.

## Base URL

All paths in the schema are rooted at `/api/v1/...`. You must point the examples at the correct **API origin** (scheme + host, optionally port; **no** trailing slash).

Set:

| Variable | Meaning |
| -------- | ------- |
| `ANERA_MARKETS_API_BASE_URL` | Origin only, i.e. `https://api.anera.markets` |

The examples **require** this variable so they never silently call the wrong environment.

## API overview

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/v1/distinct-models` | All distinct models (`model_slug`, `model_name`) |
| `GET` | `/api/v1/token-factories` | All distinct token factories (`provider_slug`, `provider_name`) |
| `GET` | `/api/v1/companies` | All distinct companies (`provider`) |
| `GET` | `/api/v1/revenue/{resource_type}` | Ranked revenue in USD for one day |
| `GET` | `/api/v1/token-utilisation/{resource_type}` | Ranked token usage for one day |
| `GET` | `/api/v1/attestations/{event_id}` | Canonical outcome for a prediction market event |

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
- **Attestation:** `{ event_id, start_time, end_time, finalised_time, outcome }`

See `openapi.json` for full schemas and validation rules.

---

## Data Note

All our data is made available t+1. This means that Monday's data can only be accessed on Tuesday. Traders on financial markets using this data must make note of this. 

## Examples

* **General API examples** [ [python](python/general-examples/examples.py) | [typescript](typescript/general-examples/examples.ts) ]
* **Company revenue by date range** [ [python](python/company-revenue/examples.py) | [typescript](typescript/company-revenue/src/examples.ts) ]
* **Token utilisation by token type** [ [python](python/token-utilisation/examples.py) | [typescript](typescript/token-utilisation/src/examples.ts) ]
* **Top models by revenue** [ [python](python/top-models/examples.py) | [typescript](typescript/top-models/src/examples.ts) ]
* **Revenue trend analysis** [ [python](python/revenue-trend/examples.py) | [typescript](typescript/revenue-trend/src/examples.ts) ]
* **Attestation for prediction market event** [ [python](python/attestations/examples.py) | [typescript](typescript/attestations/examples.ts) ]

---

## Python

**Requirements:** Python 3.10+ recommended (uses modern typing). Dependencies are listed in [`python/requirements.txt`](python/requirements.txt).

```bash
cd python
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export ANERA_MARKETS_API_BASE_URL='https://api.anera.markets'
python general-examples/examples.py
```

[`python/general-examples/examples.py`](python/general-examples/examples.py) defines small functions—`get_models()`, `get_token_factories()`, `get_companies()`, `get_revenue(...)`, `get_token_utilisation(...)`, `get_attestation(...)`—that mirror the endpoints. Running the file as a script prints truncated JSON samples for each call so you can verify connectivity quickly.

Import and reuse the functions from your own code, or copy the `_get` pattern if you prefer a single generic helper.

For a dedicated attestation example, see [`python/attestations/examples.py`](python/attestations/examples.py).

```bash
cd python
python attestations/examples.py
```

---

## TypeScript (Node.js)

**Requirements:** Node.js **18+** (global `fetch`) and npm. [`typescript/package.json`](typescript/package.json) pins the TypeScript compiler as a dev dependency.

[`typescript/general-examples/types.ts`](typescript/general-examples/types.ts) defines **request** query types (`RevenueQueryParams`, `TokenUtilisationQueryParams`) and **response** types (`ModelItem`, `RevenueResponse`, `TokenUtilisationResponse`, `AttestationResponse`, row types, etc.) aligned with [`openapi.json`](openapi.json).

[`typescript/general-examples/examples.ts`](typescript/general-examples/examples.ts) implements typed `fetch` helpers with `Promise<…>` return types and re-exports the public types for convenience.

```bash
cd typescript
npm install
npm run build
export ANERA_MARKETS_API_BASE_URL='https://api.anera.markets'
npm start
# runs: node dist/examples.js
```

For a dedicated attestation example, see [`typescript/attestations/`](typescript/attestations/).

```bash
cd typescript/attestations
npm install
npm run build
export ANERA_MARKETS_API_BASE_URL='https://api.anera.markets'
npm start
```

In the browser, you can port the same types and adapt the `fetch` calls, subject to **CORS** policy on the API host.

---

## Troubleshooting

- **`ANERA_MARKETS_API_BASE_URL` not set:** Both example entrypoints exit with a short message; export the variable as shown above.
- **HTTP 4xx / 5xx:** The TypeScript example surfaces status and body text in thrown `Error`s. For Python, `requests` raises `HTTPError`; wrap or log `response.text` for details.
- **422 validation:** Path or query values must match the enums in `openapi.json` (for example `resource_type` must be exactly `token-factory`, `model`, or `company`).
