import {Request, Response} from "express";
import { semanticSearch } from "../services/semanticSearchService";

export const semanticProductSearch = async(req:Request, res:Response) =>{
    try{
        const query = String(req.body.query || "");
        if(!query){
            return res.status(400).json({
                error: "query is required"
            });
        }

        const results = await semanticSearch(query);
        res.status(200).json({
            query,
            results
        });
    }catch(error){
        console.error("semantic search failed", error);
        res.status(500).json({
            error:"semantic search failed"
        });
    }
};