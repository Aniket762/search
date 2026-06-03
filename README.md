# search 🔎 🔥

A loosely coupled deterministic and semantic search service built using Express, PostgreSQL, Prisma and Pgvector. 

The goal was to support both traditional filter-based search and natural language search without relying on an LLM for every part of the search process.

The service separated deterministic search from LLM search:
- Deterministic search handles filtering, pagination, and exact matches (no regex)
- LLM is used to understand the user's intent and convert natural language to JSON
- Semantic search is used as a fallback when an SQL query returns fewer than or equal to 5 products.

## DB Design
Product: Stores the product catalog and searchable metadata for field refer to   `prisma/schema.prisma`

Embeddings: Product embeddings are stored in pgsql using pgvector. Embeddings are generated from 
```
name
category
subcategory
description
searchKeywords
```
## LLM Model
Model Used: Gemini 2.5 Flash
LLM only requires processing queries and filter extraction.

Gemini 2.5 Flash provides good instruction following at a very low cost. The model is fast enough for search workloads. Using a better LLM model would increase both the cost and latency. 

One API call per user search, no calls during filtering, ranking, pagination, or semantic retrieval. 

Approximate Tokens Per Call
Input: 500-700
Output: 20-60 
Total: 600-750

Estimated cost for 1,000 Searches Per Day: $0.0075 

For higher accuracy, Gemini 2.5 Pro or Claude Sonnet could be used. 


<img width="1600" height="1000" alt="embeddings data" src="https://github.com/user-attachments/assets/d43e94d0-ae8b-4d95-9e8f-41b6cf4cf746" />

<img width="1440" height="772" alt="product data with sku pk" src="https://github.com/user-attachments/assets/817406c4-9d95-4bdb-bb56-3e376d485ecc" />

<img width="1440" height="772" alt="Swagger UI with all endpoints" src="https://github.com/user-attachments/assets/ef67066a-91f2-47c0-86f7-9f2bf334f55c" />

<img width="1440" height="772" alt="Post call response" src="https://github.com/user-attachments/assets/a4288702-d51b-4842-a320-feb601fab89b" />



## Setup Guide

Connect to pqsql through docker:
docker run -d --name search-db -e POSTGRES_USER=<username> -e POSTGRES_PASSWORD=<password> -e POSTGRES_DB=product_search -p 5433:5432 pgvector/pgvector:pg16
docker ps
docker start search-db
docker logs search-db
docker exec -it search-db bash

Inside pgsql
psql -U postgres
\c products
CREATE EXTENSION IF NOT EXISTS vector;
\dx to confirm if vector is created

Add embedding column
ALTER TABLE "Product"
ADD COLUMN embedding vector(384);

exit -> \q

Script to product pipe data
npx tsx scripts/importProduct.ts

Script to generate embedding data
npx tsx scripts/generateEmbeddings.ts

Prisma Commands
npx prisma db push - db sync with prisma schema
npx prisma migrate reset   - db reset
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio - UI for pgsql data

Note:
Port 5433 to Mac , inside container it is 5432
DATABASE_URL="postgresql://postgres:<password>@localhost:5433/<dbName>"
