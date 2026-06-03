import {Request, Response} from "express";
import {keywordSearch} from "../services/productSearchService";
import {pareseNaturalLanguageQuery } from "../services/queryParserService";
import { searchProducts as searchProductService } from "../services/productSearchService";

export const searchProducts = async (req: Request, res: Response) => {
    try {
        const query = String(req.body.query || "");
        const results = await keywordSearch(query);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({ error: "Failed to search products" });
    }
};  

export const searchProductsLLM = async (req:Request, res:Response) =>{
    try{
        const query = String (req.body.query || "");
        const parsed = await pareseNaturalLanguageQuery(query);
        const results = await searchProductService(parsed);
        res.status(200).json({
            originalQuery: query, // added for debugging
            parsedQuery: parsed, // added for debugging
            results
        });
    }catch(error){
        console.log("error searching products: ", error);
        res.status(500).json({error:"failed to search products"});
    }
}