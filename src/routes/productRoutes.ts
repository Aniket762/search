import {Router} from "express";
import {fetchProducts,fetchProductBySku} from "../controllers/productController";
import { searchLogger } from "../middleware/searchLogger";

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get paginated list of products
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Product list returned successfully
 */
router.get("/", searchLogger ,fetchProducts);

/**
 * @swagger
 * /api/products/{skuId}:
 *   get:
 *     summary: Get product by SKU
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: skuId
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU ID of the product
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
router.get("/:skuId",searchLogger,fetchProductBySku);

export default router;