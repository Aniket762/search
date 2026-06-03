import {prisma} from "../prisma/prismaClient";
import { generateEmbedding } from "./embeddingService";

export async function semanticSearch(query: string, limit:number=20){
    const embedding = await generateEmbedding(query);
    const vectorString = `[${embedding.join(",")}]`;

    const results = await prisma.$queryRawUnsafe(
        `
        SELECT
            *,
            embedding <=> '${vectorString}'::vector AS distance
        FROM "Product"
        WHERE embedding IS NOT NULL
        ORDER BY distance ASC
        LIMIT ${limit}
        `,
        vectorString,
        limit
    );
    
    return results;
}