import {Request, Response} from "express";
import { hybridSearch } from "../services/hybridSearchService";

export const hybridProductSearch = async(req:Request,res:Response) =>{
    try{
        const query = String(req.body.query || "");
        if(!query){
            return res.status(400).json({
                error: "query is required"
            });
        }

        const results = await hybridSearch(query);
        res.status(200).json(results);
    }catch(error){
        console.error(error);
        res.status(500).json({
            error:"hybrid search failed"
        });
    }
}