import {Request, Response} from "express";
import {keywordSearch} from "../services/productSearchService";

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
