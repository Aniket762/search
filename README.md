# search 🔎 🔥

A loosely coupled deterministic and semantic search service built using Express, PostgreSQL, Prisma, and pgvector.
The goal was to support both traditional filter-based search and natural language search without relying on an LLM for every part of the search process.

The service separates deterministic search from LLM-powered search:

- **Deterministic search** handles filtering, pagination, and exact matches (no regex)
- **LLM** is used to understand the user's intent and convert natural language to JSON
- **Semantic search** is used as a fallback when an SQL query returns 5 or fewer products
- **Logging** stores query and network round-trip time

## DB Design

**Product:** Stores the product catalog and searchable metadata. For field definitions, refer to `prisma/schema.prisma`.

**Embeddings:** Product embeddings are stored in PostgreSQL using pgvector. Embeddings are generated from the following fields:

```
name
category
subcategory
description
searchKeywords
```

## LLM Model 🤖

**Model used:** Gemini 2.5 Flash

The LLM is only responsible for processing queries and extracting filters. Gemini 2.5 Flash provides strong instruction-following capability at a very low cost and is fast enough for search workloads. Using a more capable model would increase both cost and latency.

**One API call per user search** — no calls during filtering, ranking, pagination, or semantic retrieval.

**Approximate tokens per call:**

| | Tokens |
|---|---|
| Input | 500–700 |
| Output | 20–60 |
| Total | 600–750 |

**Estimated cost for 1,000 searches/day:** ~$0.0075

> For higher accuracy, Gemini 2.5 Pro or Claude Sonnet could be used as a drop-in replacement.

## API Documentation + Embeddings
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
