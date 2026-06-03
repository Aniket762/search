# Search 🔎 🔥

A loosely coupled deterministic and semantic search service built using Express, PostgreSQL, Prisma, and pgvector.
The goal was to support both traditional filter-based search and natural language search without relying on an LLM for every part of the search process.

The service separates deterministic search from LLM-powered search:

- **Deterministic search** handles filtering, pagination, and exact matches (no regex)
- **LLM** is used to understand the user's intent and convert natural language to JSON
- **Semantic search** is used as a fallback when an SQL query returns 5 or fewer products
- **Logging** stores query and network round-trip time

## DB Design 🗼

**Product:** Stores the product catalog and searchable metadata. For field definitions, refer to `prisma/schema.prisma`.

**Embeddings:** Product embeddings are stored in PostgreSQL using pgvector. Embeddings are generated from the following fields:

```
name
category
subcategory
description
searchKeywords
```

## Search Flow 🏗️

We convert a natural language query into structured filters. For example:

```
Query: Modern Grey sofa for Living room
```
The query is passed to LLM using `pareseNaturalLanguageQuery`. The function calls the model and creates the JSON object, like:

```json
{
  "category": "Sofa",
  "color": "Grey",
  "room": "Living Room"
}
```

These filters are then applied using Prisma and PostgreSQL. If we get less than 5 records from the structured query, we move to semantic search.

The query is embedded. For embedding, we are using `@xenova/transformers`. The converted embedding is compared against product embeddings stored in PgSQL using pgvector. We use 384 dimensions to store vector embeddings.

<img width="1110" height="740" alt="Table Schema" src="https://github.com/user-attachments/assets/5716162d-d492-4fc7-ba16-ff5716395ac7" />

We have implemented a hybrid strategy that prefers deterministic results wherever possible.

Semantic search is only used as a fallback when structured search returns fewer than 5 results. To avoid unnecessary vector searches while still improving recall for difficult queries.

```
Natural Language Query
        ↓
LLM Parser
        ↓
Deterministic Search
        ↓
Results >= 5 ?
       / \
      Yes  No
      |     |
      |     ↓
      | Semantic Search
      |     ↓
      └─────┘
        ↓
      Response
```


## LLM Model 🤖

**Model used:** Gemini 2.5 Flash

**Why Gemini 2.5**
The LLM is only responsible for processing queries and extracting filters. Gemini 2.5 Flash provides strong instruction-following capability at a very low cost and is fast enough for search workloads. Using a more capable model would increase both cost and latency.

**One API call per user search** — no calls during filtering, ranking, pagination, or semantic retrieval.


### Cost Estimation 💰
The rough universal rule is that 1 token is 4 characters for English text.

1. Considering the search is enabled for English.
2. Approximately 100-character user query

| | Characters | Tokens |
|---|---|---|
| System prompt | ~1,500 | ~375 |
| User query | ~100 | ~25 |
| **Total input** | | **~400** |
| JSON filter output | | ~20–60 |

The output is constrained to a JSON filter
```json
{
  "category": "Sofa", "color": "Grey", "room": "Living Room"
}
```

Since the output is 4x the input token-wise. We have minimized the overall cost. We have handled it via
`7. Return ONLY raw JSON. Do not wrap in markdown code blocks.`

Daily Cost at 1,000 Searches lands somewhere at

| | Tokens | Price per 1M | Daily cost |
|---|---|---|---|
| Input | 400 × 1,000 = 400,000 | $0.075 | $0.030 |
| Output | 40 × 1,000 = 40,000 | $0.30 | $0.012 |
| **Total** | | | **~$0.042** |

To improve on the cost optimization for further analytics, we can use tiktoken for Gemini models to count tokens.

> For higher accuracy, Gemini 2.5 Pro or Claude Sonnet could be used as a drop-in replacement.

## API Documentation + Embeddings + PgSQL
<img width="1600" height="1000" alt="embeddings data" src="https://github.com/user-attachments/assets/d43e94d0-ae8b-4d95-9e8f-41b6cf4cf746" />

<img width="1440" height="772" alt="product data with sku pk" src="https://github.com/user-attachments/assets/817406c4-9d95-4bdb-bb56-3e376d485ecc" />

<img width="1440" height="772" alt="Swagger UI with all endpoints" src="https://github.com/user-attachments/assets/ef67066a-91f2-47c0-86f7-9f2bf334f55c" />

<img width="1440" height="772" alt="Post call response" src="https://github.com/user-attachments/assets/a4288702-d51b-4842-a320-feb601fab89b" />

<img width="1440" height="655" alt="Logging Network RTT + Query in pgsql" src="https://github.com/user-attachments/assets/ace4262e-ddb3-4d8a-b7d6-5d84445198f4" />



## Setup Guide 🦾

### 1. Start the Database

Run a pgvector-enabled PostgreSQL instance via Docker:

```bash
docker run -d \
  --name search-db \
  -e POSTGRES_USER=<user> \
  -e POSTGRES_PASSWORD=<password> \
  -e POSTGRES_DB=product_search \
  -p 5433:5432 \
  pgvector/pgvector:pg16
```

Useful Docker commands:

```bash
docker ps
docker start search-db
docker logs search-db
docker exec -it search-db bash
```

### 2. Enable the pgvector Extension

Connect to the database inside the container:

```bash
psql -U postgres
\c product_search
```

Then enable the extension and verify it was created:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
\dx
```

### 3. Add the Embedding Column

```sql
ALTER TABLE "Product"
ADD COLUMN embedding vector(384);
```

Exit psql with `\q`.

### 4. Sync the Schema and Seed Data

Push the Prisma schema to the database:

```bash
npx prisma db push
```

Import product data and generate embeddings:

```bash
npx tsx scripts/importProduct.ts
npx tsx scripts/generateEmbeddings.ts
```

### Prisma Commands Reference

| Command | Description |
|---|---|
| `npx prisma db push` | Sync the database with the Prisma schema |
| `npx prisma migrate reset` | Reset the database |
| `npx prisma generate` | Regenerate the Prisma client |
| `npx prisma migrate dev --name init` | Create and apply a new migration |
| `npx prisma studio` | Open the Prisma visual data browser |

### Notes

- Port `5433` is exposed to the host; the container listens internally on `5432`.
- Set the connection string in your `.env` file:

```
DATABASE_URL="postgresql://postgres:<password>@localhost:5433/product_search"
```
