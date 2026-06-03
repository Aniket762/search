import express from "express";
import productRoutes from "./routes/productRoutes";

const app = express();

app.use("/api/products", productRoutes);

app.get("/doctor",(_,res)=>{
    res.json({
        success: true,
        message: "Doctor confirmed server is healthy"
    });
});

export default app;