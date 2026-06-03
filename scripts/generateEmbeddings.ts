// ingestion job for generating embeddings
import {prisma} from "../src/prisma/prismaClient";
import {generateEmbedding} from "../src/services/embeddingService";

async function main(){
    const products = await prisma.product.findMany();

    for(const product of products){
        const searchableText = [
            product.name,
            product.category,
            product.subcategory,
            product.description,
            product.searchKeywords
        ]
        .filter(Boolean)
        .join(" ");

        const embedding = await generateEmbedding(searchableText);

        await prisma.$executeRawUnsafe(
            `
            UPDATE "Product"
            SET embedding = '[${embedding.join(",")}]'::vector
            WHERE "skuId" = '${product.skuId}'
            `
        );

        console.log(`embedded ${product.skuId}`);
    }
}

main()
.then(()=> process.exit(0))
.catch(console.error);