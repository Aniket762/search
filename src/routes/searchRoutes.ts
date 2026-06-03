import { Router } from "express";
import {searchProductsLLM, searchProducts} from "../controllers/searchController";
import { hybridProductSearch } from "../controllers/hybridSearchController";
const router = Router();

/**
 * @swagger
 * /api/search/:
 *   post:
 *     summary: Search products by query
 *     tags:
 *       - Search
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: chair
 *     responses:
 *       200:
 *         description: Matching products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Failed to search products
 */
router.post("/", searchProducts);

/**
 * @swagger
 * /api/search/ai:
 *   post:
 *     summary: Search products using natural language
 *     description: Uses OpenRouter to extract structured filters from a natural language query and performs product search using PostgreSQL.
 *     tags:
 *       - Search
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: modern grey sofa for living room
 *     responses:
 *       200:
 *         description: Search results returned successfully
 *       500:
 *         description: Internal server error
 */
router.post("/ai",searchProductsLLM);

/**
 * @swagger
 * /api/search/hybrid:
 *   post:
 *     summary: Hybrid search using AI parsing and semantic fallback
 *     tags:
 *       - Search
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: modern grey sofa for living room
 *     responses:
 *       200:
 *         description: Hybrid search results
 */
router.post("/hybrid",hybridProductSearch);

export default router;