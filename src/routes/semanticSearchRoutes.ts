import {Router} from "express";
import {semanticProductSearch} from "../controllers/semanticSearchController";
import { searchLogger } from "../middleware/searchLogger";

const router = Router();

/**
 * @swagger
 * /api/search/semantic:
 *   post:
 *     summary: Semantic product search
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
 *                 example: comfortable couch for living room
 *     responses:
 *       200:
 *         description: Semantic search results
 */
router.post("/semantic", searchLogger, semanticProductSearch);

export default router;