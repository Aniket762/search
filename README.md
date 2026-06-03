# search

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
