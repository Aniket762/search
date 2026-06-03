# search


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