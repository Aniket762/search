import express from "express";
import productRoutes from "./routes/productRoutes";
import searchRoutes from "./routes/searchRoutes";
import semanticRoutes from "./routes/semanticSearchRoutes";
import { setupSwagger } from "./config/swagger";

const app = express();

app.use(express.json());

app.use("/api/products", productRoutes);

app.use("/api/search",searchRoutes);

app.use("/api/search", semanticRoutes);

app.get("/doctor",(_,res)=>{
    res.json({
        success: true,
        message: "Doctor confirmed server is healthy"
    });
});

setupSwagger(app);
export default app;