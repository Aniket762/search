import { pareseNaturalLanguageQuery } from "./queryParserService";
import { searchProducts } from "./productSearchService";
import { semanticSearch } from "./semanticSearchService";

export async function hybridSearch(query:string){
    const parsedQuery = await pareseNaturalLanguageQuery(query);
    const structuredResults = await searchProducts(parsedQuery);
    const products = structuredResults.products??[];

    if(products.length>=5){
        return{
            searchType: "structured",
            parsedQuery,
            results: products
        }
    }

    const semanticResults = await semanticSearch(query);
    return{
        searchType: "semantic-fallback",
        parsedQuery,
        results:semanticResults
    };
}