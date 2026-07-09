# [anera.markets](https://anera.markets) public API examples

This repository contains small, runnable examples for the **anera.markets** public [HTTP API](https://api.anera.markets/docs/v1/public): listing models, token factories, and companies, daily **revenue** and **token utilisation** rankings by resource type, **ticker** historical values, prediction market **attestations**, market indices, and intelligence analytics.

The machine-readable contract lives in [`openapi.json`](openapi.json) (OpenAPI 3.1). Use it with codegen tools, Postman, or any OpenAPI-aware client if you prefer not to hand-roll requests.

## Base URL

All paths are rooted at `/api/...`. You must point the examples at the correct **API origin** (scheme + host, optionally port; **no** trailing slash).

Set:

| Variable | Meaning |
| -------- | ------- |
| `ANERA_MARKETS_API_BASE_URL` | Origin only, i.e. `https://api.anera.markets` |

The examples **require** this variable so they never silently call the wrong environment.

## API Endpoints

### Public endpoints (no authentication required)

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/v1/public/models` | All distinct models (`model_slug`, `model_name`) |
| `GET` | `/api/v1/public/token-factories` | All distinct token factories (`provider_slug`, `provider_name`) |
| `GET` | `/api/v1/public/companies` | All distinct companies (`provider`) |
| `GET` | `/api/v1/public/revenue/{resource_type}` | Ranked revenue in USD for one day |
| `GET` | `/api/v1/public/token-utilisation/{resource_type}` | Ranked token usage for one day |
| `GET` | `/api/v1/public/attestations/{event_id}` | Canonical outcome for a prediction market event |

### Authenticated endpoints (API key required)

These endpoints require API key authentication (`X-API-ACCESS-KEY` and `X-API-SECRET-KEY` headers).

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/index-families` | List index families and primary index details |
| `GET` | `/api/indices` | List market indices with optional `featured` filter |
| `GET` | `/api/indices/summary` | Summary statistics (models count, token spend) |
| `GET` | `/api/indices/{index_id}` | Detailed information for a single index |
| `GET` | `/api/tokens/daily` | Total token count and previous-day delta |
| `GET` | `/api/tickers/{symbol}/history` | Historical ticker values (default 30 days) |
| `GET` | `/api/intelligence/models/rankings` | Model rankings by revenue or tokens |
| `GET` | `/api/intelligence/models/daily-revenue-per-model` | Daily revenue aggregated across all models |
| `GET` | `/api/intelligence/models/model/{model_id}` | Model overview |
| `GET` | `/api/intelligence/models/model/{model_id}/summary` | Model summary statistics |
| `GET` | `/api/intelligence/models/model/{model_id}/breakdown/daily-revenue-by-token-factory` | Model revenue broken down by factory |
| `GET` | `/api/intelligence/models/model/{model_id}/breakdown/daily-token-ratio` | Daily token ratio for a model |
| `GET` | `/api/intelligence/model-family/rankings` | Model family rankings |
| `GET` | `/api/intelligence/model-family/daily-revenue` | Daily revenue across model families |
| `GET` | `/api/intelligence/model-family/family/{family_id}` | Model family overview |
| `GET` | `/api/intelligence/model-family/family/{family_id}/summary` | Model family summary |
| `GET` | `/api/intelligence/model-family/family/{family_id}/breakdown/daily-revenue-per-model` | Family revenue per model |
| `GET` | `/api/intelligence/model-family/family/{family_id}/breakdown/model-rankings` | Model rankings within a family |
| `GET` | `/api/intelligence/token-factory/rankings` | Token factory rankings |
| `GET` | `/api/intelligence/token-factory/daily-revenue` | Daily revenue across token factories |
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

**Ticker history:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `startDate` | `YYYY-MM-DD` | Start date. Defaults to 30 days ago if omitted. |
| `endDate` | `YYYY-MM-DD` | End date. Defaults to now if omitted. |

**Intelligence endpoints:**

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
- **Ticker history:** `[ { date, value } ]`
- **Daily tokens:** `{ totalCount, delta, lastUpdated }`
- **Index families:** `[ { family_id, family_name, family_description, family_tickers, primary_index: { index_id, index_name, index_value, index_chart_data } } ]`

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
| **Attestations** | Prediction market event outcomes (resolved/unresolved/unknown) | [python/attestations/examples.py](python/attestations/examples.py) | [typescript/attestations/examples.ts](typescript/attestations/examples.ts) |
| **Top models** | Top revenue-generating models | [python/top-models/examples.py](python/top-models/examples.py) | [typescript/top-models/src/examples.ts](typescript/top-models/src/examples.ts) |
| **Revenue trend** | Track company revenue changes over time | [python/revenue-trend/examples.py](python/revenue-trend/examples.py) | [typescript/revenue-trend/src/examples.ts](typescript/revenue-trend/src/examples.ts) |
| **Token utilisation** | Token consumption by type (total/prompt/completion/reasoning) | [python/token-utilisation/examples.py](python/token-utilisation/examples.py) | [typescript/token-utilisation/src/examples.ts](typescript/token-utilisation/src/examples.ts) |
| **Company revenue** | Top company revenue rankings for a date range | [python/company-revenue/examples.py](python/company-revenue/examples.py) | [typescript/company-revenue/src/examples.ts](typescript/company-revenue/src/examples.ts) |

### Authenticated endpoints (API key required)

| Example | Description | Python | TypeScript |
| ------- | ----------- | ------ | ---------- |
| **Index families** | List index families and primary index details | [python/index-families/examples.py](python/index-families/examples.py) | [typescript/index-families/src/examples.ts](typescript/index-families/src/examples.ts) |
| **Indices** | Market indices, summary stats, single index detail | [python/indices/examples.py](python/indices/examples.py) | [typescript/indices/src/examples.ts](typescript/indices/src/examples.ts) |
| **Daily tokens** | Total token count and previous-day delta | [python/tokens-daily/examples.py](python/tokens-daily/examples.py) | [typescript/tokens-daily/src/examples.ts](typescript/tokens-daily/src/examples.ts) |
| **Tickers** | Historical ticker price data | [python/tickers/examples.py](python/tickers/examples.py) | [typescript/tickers/src/examples.ts](typescript/tickers/src/examples.ts) |
| **Model intelligence** | Model rankings, daily revenue, summaries, token ratios | [python/intelligence/models/examples.py](python/intelligence/models/examples.py) | [typescript/intelligence/models/src/examples.ts](typescript/intelligence/models/src/examples.ts) |
| **Model family** | Family rankings, daily revenue, per-model breakdowns | [python/intelligence/model-family/examples.py](python/intelligence/model-family/examples.py) | [typescript/intelligence/model-family/src/examples.ts](typescript/intelligence/model-family/src/examples.ts) |
| **Token factory** | Factory rankings, daily revenue, per-model breakdowns | [python/intelligence/token-factory/examples.py](python/intelligence/token-factory/examples.py) | [typescript/intelligence/token-factory/src/examples.ts](typescript/intelligence/token-factory/src/examples.ts) |

---

## Python

**Requirements:** Python 3.11+. Dependencies are listed in [`python/requirements.txt`](python/requirements.txt).

```bash
cd python
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export ANERA_MARKETS_API_BASE_URL='https://api.anera.markets'
python general-examples/examples.py
```

[`python/general-examples/examples.py`](python/general-examples/examples.py) defines small functions—`get_models()`, `get_token_factories()`, `get_companies()`, `get_revenue(...)`, `get_token_utilisation(...)`, `get_attestation(...)`—that mirror the public endpoints. Running the file as a script prints truncated JSON samples for each call so you can verify connectivity quickly.

Each dedicated example directory can be run independently:

```bash
cd python
python attestations/examples.py
python top-models/examples.py
python indices/examples.py
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

In the browser, you can port the same types and adapt the `fetch` calls, subject to **CORS** policy on the API host.

---

## Troubleshooting

- **`ANERA_MARKETS_API_BASE_URL` not set:** Examples use `https://api.anera.markets` as the default fallback. Export the variable to override.
- **HTTP 401 Unauthorized:** Authenticated endpoints require API key headers (`X-API-ACCESS-KEY` and `X-API-SECRET-KEY`). Obtain keys from your Anera developer dashboard.
- **HTTP 4xx / 5xx:** The TypeScript examples surface status codes and body text in thrown `Error`s. For Python, `requests` raises `HTTPError`; wrap or log `response.text` for details.
- **404 Not Found:** The endpoint or resource does not exist. Check that the path matches the [endpoint table](#api-endpoints) above and that path/query values are valid (e.g. `resource_type` must be `token-factory`, `model`, or `company`).
- **Empty results:** The API returns `items: []` when no data is available for the requested date/resource combination. This is expected for future dates or recently deleted resources.

</content>