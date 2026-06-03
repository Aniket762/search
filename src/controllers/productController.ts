import {Request, Response} from "express";
import {prisma} from "../prisma/prismaClient";
import {getProductBySku, getProducts} from "../services/productSearchService";
import {keywordSearch} from "../services/productSearchService";

export const fetchProducts = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 20;
        const products = await getProducts(page, pageSize);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

export async function fetchProductBySku(req:Request, res:Response){
    try{
        const {skuId} = req.params;
        const product = await getProductBySku(skuId as string);

        if(!product){
            return res.status(404).json({
                message: "product not found"
            });
        }

        res.status(200).json(product);
    }catch(error){
        res.status(500).json({
            message: "failed to get product"
        })
    }
}