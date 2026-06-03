import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/prismaClient";

export const searchLogger = async (req: Request,res: Response,next: NextFunction) => {
    const query = String(req.body?.query ?? "");
    const startTime = Date.now();

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
        const responseTime = Date.now() - startTime;

        prisma.searchLog.create({
            data: {
                query,
                responseTimeMs: responseTime,
                statusCode: res.statusCode,
                resultCount: Array.isArray(body) ? body.length : body?.results?.length ?? null,
            },
        }).catch((err:any) => console.error("failed to log:", err));

        return originalJson(body);
    };

    next();
};