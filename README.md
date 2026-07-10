# [anera.markets](https://anera.markets) public API examples

This repository contains small, runnable examples for the **anera.markets** public [HTTP API](https://api.anera.markets/docs/v1/public): listing models, token factories, and companies; daily **revenue** and **token utilisation** rankings by resource type; **ticker** historical values; prediction market **attestations**; market indices; and intelligence analytics.

The machine-readable contract lives in [`openapi.json`](openapi.json) (OpenAPI 3.1). Use it with codegen tools, Postman, or any OpenAPI-aware client if you prefer not to hand-roll requests.

## Base URL

All paths are rooted at `/api/...`. You must point the examples at the correct **API origin** (scheme + host, optionally port; **no** trailing slash).

Set:

| Variable | Meaning |
| -------- | ------- |
| `ANERA_MARKETS_API_BASE_URL` | Origin only, i.e. `https://api.anera.markets` |

The examples default to `https://api.anera.markets` if this variable is not set. Override it to target a different environment.

See [`.env.example`](.env.example) for all supported variables.

## Authentication

Most public endpoints require no authentication. Two additional key-based mechanisms are used for specific features:

### Dual-key authentication (Intelligence endpoints)

The `/api/intelligence/...` endpoints require an **access key** and a **secret key**, sent as custom headers:

| Header | Env Variable |
| ------ | ------------ |
| `X-API-ACCESS-KEY` | `ANERA_MARKETS_API_ACCESS_KEY` |
| `X-API-SECRET-KEY` | `ANERA_MARKETS_API_SECRET_KEY` |

Obtain keys from your [Anera developer dashboard](https://dashboard.anera.markets). Without valid keys, requests return `401 Unauthorized`.

### Single-key authorization (Extended history)

To query ticker history beyond the free 7-day window, pass an **access key** (prefixed `iai_sk_`) via the standard `Authorization` header:

| Header | Env Variable |
| ------ | ------------ |
| `Authorization` | `ANERA_MARKETS_API_KEY` |

The Python `indices` example uses this to unlock 30-day history. Without it, the extended-range demo skips with a message.

## API Endpoints

### Public endpoints (no authentication required)

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/v1/distinct-models` | All distinct models (`model_slug`, `model_name`) |
| `GET` | `/api/v1/token-factories` | All distinct token factories (`provider_slug`, `provider_name`) |
| `GET` | `/api/v1/companies` | All distinct companies (`provider`) |
| `GET` | `/api/v1/revenue/{resource_type}` | Ranked revenue in USD for one day |
| `GET` | `/api/v1/token-utilisation/{resource_type}` | Ranked token usage for one day |
| `GET` | `/api/v1/attestations/{event_id}` | Canonical outcome for a prediction market event |
| `GET` | `/api/v1/indices` | List market indices (optional `featured` filter) |
| `GET` | `/api/v1/indices/summary` | Summary statistics (models count, token spend) |
| `GET` | `/api/v1/indices/{index_id}` | Detailed information for a single index |
| `GET` | `/api/v1/tickers/{symbol}` | Historical ticker values (7 days free; wider ranges require `Authorization` header) |

### Authenticated intelligence endpoints

These endpoints require dual-key authentication. See the [authentication section](#authentication).

#### Model intelligence

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/intelligence/models/daily-revenue-per-model` | Daily revenue aggregated across all models |
| `GET` | `/api/intelligence/models/rankings` | Model rankings by revenue or tokens |
| `GET` | `/api/intelligence/models/model/{model_id}` | Model overview |
| `GET` | `/api/intelligence/models/model/{model_id}/summary` | Model summary statistics |
| `GET` | `/api/intelligence/models/model/{model_id}/breakdown/daily-revenue-by-token-factory` | Model revenue broken down by factory |
| `GET` | `/api/intelligence/models/model/{model_id}/breakdown/daily-token-ratio` | Daily token ratio for a model |

#### Model family intelligence

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/intelligence/model-family/daily-revenue` | Daily revenue across model families |
| `GET` | `/api/intelligence/model-family/rankings` | Model family rankings |
| `GET` | `/api/intelligence/model-family/family/{family_id}` | Model family overview |
| `GET` | `/api/intelligence/model-family/family/{family_id}/summary` | Model family summary |
| `GET` | `/api/intelligence/model-family/family/{family_id}/breakdown/daily-revenue-per-model` | Family revenue per model |
| `GET` | `/api/intelligence/model-family/family/{family_id}/breakdown/model-rankings` | Model rankings within a family |

#### Token factory intelligence

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/intelligence/token-factory/daily-revenue` | Daily revenue across token factories |
| `GET` | `/api/intelligence/token-factory/rankings` | Token factory rankings |
| `GET` | `/api/intelligence/token-factory/factory/{factory_id}` | Token factory overview |
| `GET` | `/api/intelligence/token-factory/factory/{factory_id}/summary` | Token factory summary |
| `GET` | `/api/intelligence/token-factory/factory/{factory_id}/breakdown/daily-revenue-per-model` | Factory revenue per model |
| `GET` | `/api/intelligence/token-factory/factory/{factory_id}/breakdown/model-rankings` | Model rankings within a factory |

### Query parameters

#### Revenue and token utilisation

| Parameter | Description |
| --------- | ----------- |
| `timestamp` | Optional. `YYYY-MM-DD` or ISO-8601. If omitted, the API uses the **latest available** day. |
| `resource_id` | Optional. Restrict to a single resource; omit for **all** resources. |

**Token utilisation only:**

| Parameter | Description |
| --------- | ----------- |
| `token_type` | `total` (default), `prompt`, `completion`, or `reasoning`. Relevant for model/company views. |

#### Ticker history

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `startDate` | `YYYY-MM-DD` | Start date. Defaults to 7 days ago if omitted (unauthenticated). Wider date ranges require an `Authorization` header. |
| `endDate` | `YYYY-MM-DD` | End date. Defaults to now if omitted. |

#### Intelligence endpoints

| Parameter | Description |
| --------- | ----------- |
| `days` | Number of days to aggregate over. |
| `metric` | Sort metric: `revenue`, `tokens`, or `utilisation` (factory rankings only). |
| `limit` | Maximum results to return. |

#### Path parameter `resource_type`

One of: `token-factory`, `model`, `company`.

### Response shapes (summary)

- **Revenue:** `{ resource_type, timestamp, items?: [{ resource_id, revenue_usd }] }`
- **Token utilisation:** `{ resource_type, timestamp, token_type, items?: [{ resource_id, resource_name, token_count, rank }] }`
- **Attestation:** `{ event_id, start_time, end_time, finalised_time, outcome }`
- **Ticker history:** `{ symbol, start_date, end_date, items: [{ timestamp, value }] }`
- **Indices:** `{ indices: [{ id, name, symbol, value, currency, ... }], lastUpdated }`
- **Index summary:** `{ models_count, token_spend }`

See `openapi.json` for full schemas and validation rules.

---

## Data Note

All our data is made available t+1. This means that Monday's data can only be accessed on Tuesday. Traders on financial markets using this data must make note of this.

---

## Examples

### Public endpoints (no auth)

| Example | Description | Python | TypeScript |
| ------- | ----------- | ------ | ---------- |
| **General API** | Models, token factories, companies, revenue, token utilisation, attestations | [python/general-examples/examples.py](python/general-examples/examples.py) | [typescript/general-examples/examples.ts](typescript/general-examples/examples.ts) |
| **Attestations** | Prediction market event outcomes (resolved/unresolved/unknown) | [python/attestations/examples.py](python/attestations/examples.py) ([test](python/attestations/test_examples.py)) | [typescript/attestations/examples.ts](typescript/attestations/examples.ts) ([test](typescript/attestations/test_examples.ts)) |
| **Top models** | Top revenue-generating models | [python/top-models/examples.py](python/top-models/examples.py) | [typescript/top-models/src/examples.ts](typescript/top-models/src/examples.ts) |
| **Revenue trend** | Track company revenue changes over time | [python/revenue-trend/examples.py](python/revenue-trend/examples.py) | [typescript/revenue-trend/src/examples.ts](typescript/revenue-trend/src/examples.ts) |
| **Token utilisation** | Token consumption by type (total/prompt/completion/reasoning) | [python/token-utilisation/examples.py](python/token-utilisation/examples.py) | [typescript/token-utilisation/src/examples.ts](typescript/token-utilisation/src/examples.ts) |
| **Company revenue** | Top company revenue rankings for a date range | [python/company-revenue/examples.py](python/company-revenue/examples.py) | [typescript/company-revenue/src/examples.ts](typescript/company-revenue/src/examples.ts) |
| **Indices** | Market indices, summary stats, single index detail, historical data (Python only) | [python/indices/examples.py](python/indices/examples.py) | [typescript/indices/src/examples.ts](typescript/indices/src/examples.ts) |
| **Tickers** | Historical ticker price data | [python/tickers/examples.py](python/tickers/examples.py) | [typescript/tickers/src/examples.ts](typescript/tickers/src/examples.ts) |
| **Index families** | Index families grouped by symbol prefix (derived from indices) | [python/index-families/examples.py](python/index-families/examples.py) | [typescript/index-families/src/examples.ts](typescript/index-families/src/examples.ts) |
| **Daily tokens** | Total token count from company utilisation endpoint | [python/tokens-daily/examples.py](python/tokens-daily/examples.py) | [typescript/tokens-daily/src/examples.ts](typescript/tokens-daily/src/examples.ts) |

### Authenticated endpoints (API key required)

| Example | Description | Python | TypeScript |
| ------- | ----------- | ------ | ---------- |
| **Model intelligence** | Rankings, daily revenue, model overviews, summaries, factory breakdowns, token ratios | [python/intelligence/models/examples.py](python/intelligence/models/examples.py) | [typescript/intelligence/models/src/examples.ts](typescript/intelligence/models/src/examples.ts) |
| **Model family intelligence** | Rankings, daily revenue, family overviews, summaries, per-model breakdowns, intra-family rankings | [python/intelligence/model-family/examples.py](python/intelligence/model-family/examples.py) | [typescript/intelligence/model-family/src/examples.ts](typescript/intelligence/model-family/src/examples.ts) |
| **Token factory intelligence** | Rankings, daily revenue, factory overviews, summaries, per-model breakdowns, intra-factory rankings | [python/intelligence/token-factory/examples.py](python/intelligence/token-factory/examples.py) | [typescript/intelligence/token-factory/src/examples.ts](typescript/intelligence/token-factory/src/examples.ts) |

---

## Python

**Requirements:** Python 3.11+. Dependencies are listed in [`python/requirements.txt`](python/requirements.txt).

```bash
cd python
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export ANERA_MARKETS_API_BASE_URL='https://api.anera.markets'
export PYTHONPATH=.
python general-examples/examples.py
```

[`python/general-examples/examples.py`](python/general-examples/examples.py) defines small functions—`get_models()`, `get_token_factories()`, `get_companies()`, `get_revenue(...)`, `get_token_utilisation(...)`, `get_attestation(...)`—that mirror the public endpoints. Running the file as a script prints truncated JSON samples for each call so you can verify connectivity quickly.

Each dedicated example directory can be run independently:

```bash
cd python
export PYTHONPATH=.
python attestations/examples.py
python top-models/examples.py
python indices/examples.py
```

### Authenticated Python examples

The intelligence examples require API key authentication:

```bash
export ANERA_MARKETS_API_ACCESS_KEY='your-access-key'
export ANERA_MARKETS_API_SECRET_KEY='your-secret-key'
python intelligence/models/examples.py
python intelligence/model-family/examples.py
python intelligence/token-factory/examples.py
```

---

## TypeScript (Node.js)

**Requirements:** Node.js **18+** (global `fetch`) and npm. Each project ships its own `package.json` with the TypeScript compiler pinned as a dev dependency.

[`typescript/general-examples/types.ts`](typescript/general-examples/types.ts) defines **request** query types (`RevenueQueryParams`, `TokenUtilisationQueryParams`) and **response** types (`ModelItem`, `RevenueResponse`, `TokenUtilisationResponse`, `AttestationResponse`, row types, etc.) aligned with [`openapi.json`](openapi.json).

[`typescript/general-examples/examples.ts`](typescript/general-examples/examples.ts) implements typed `fetch` helpers with `Promise<…>` return types and re-exports the public types for convenience.

```bash
# General examples (root package)
cd typescript
npm install
npm run build
export ANERA_MARKETS_API_BASE_URL='https://api.anera.markets'
npm start
# runs: node dist/examples.js
```

Each dedicated example directory is a standalone project:

```bash
cd typescript/attestations
npm install
npm run build
export ANERA_MARKETS_API_BASE_URL='https://api.anera.markets'
npm start
```

For the intelligence examples, set your API keys:

```bash
export ANERA_MARKETS_API_ACCESS_KEY='your-access-key'
export ANERA_MARKETS_API_SECRET_KEY='your-secret-key'
cd typescript/intelligence/models
npm install
npm run build
npm start
```

In the browser, you can port the same types and adapt the `fetch` calls, subject to **CORS** policy on the API host.

---

## Troubleshooting

- **`ANERA_MARKETS_API_BASE_URL` not set:** Examples default to `https://api.anera.markets`. Export the variable to override.
- **`PYTHONPATH` not set (Python):** The Python examples share a common `shared/` module. Set `PYTHONPATH=.` when running examples from the `python/` directory.
- **HTTP 401 Unauthorized:** You hit an authenticated endpoint without valid keys. See the [authentication section](#authentication).
- **HTTP 4xx / 5xx:** The TypeScript examples surface status codes and body text in thrown `Error`s. For Python, `requests` raises `HTTPError`; wrap or log `response.text` for details.
- **404 Not Found:** The endpoint or resource does not exist. Check that the path matches the [endpoint table](#api-endpoints) above and that path/query values are valid (e.g. `resource_type` must be `token-factory`, `model`, or `company`).
- **Empty results:** The API returns `items: []` when no data is available for the requested date/resource combination. This is expected for future dates or recently deleted resources.
