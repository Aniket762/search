import fs from "fs";
import "dotenv/config";
import csv from "csv-parser";
import {prisma} from "../src/prisma/prismaClient";


const products:any[] = [];
let skippedCount = 0;

fs.createReadStream("./data/products.csv",{
  encoding:"utf8"
})
  .pipe(csv({
    mapHeaders:({header})=>header.replace(/^\uFEFF/,"")
  }))
  .on("data",(data) => {
    try{
      if(!data.product_id){
        skippedCount++;
        return;
      }

      let parsedDate = new Date(data.created_at);

      if(!data.created_at || isNaN(parsedDate.getTime())){
        parsedDate = new Date();
      }

      let parsedAttributes = {};

      if(data.attributes_json){
        try{
          parsedAttributes = JSON.parse(data.attributes_json);
        }catch(jsonError){
          console.error(`malformed json ${data.product_id}`);
        }
      }

      products.push({
        productId:data.product_id,
        skuId:data.sku_id,
        name:data.name,
        category:data.category || null,
        subcategory:data.subcategory || null,
        brand:data.brand || null,
        priceInr:Number(data.price_inr) || 0,
        rating:data.rating ? Number(data.rating) : null,
        reviewCount:data.review_count ? Number(data.review_count) : null,
        inventoryCount:data.inventory_count ? Number(data.inventory_count) : null,
        availability:data.availability || null,
        isActive:
          data.is_active?.toUpperCase()==="TRUE" ||
          data.is_active==="1",
        catalogStatus:data.catalog_status || null,
        color:data.color || null,
        material:data.material || null,
        room:data.room || null,
        style:data.style || null,
        unit:data.unit || null,
        description:data.description || null,
        attributesJson:parsedAttributes,
        searchKeywords:data.search_keywords || null,
        createdAt:parsedDate
      });

    }catch(error){
      console.error("Error parsing product data:",error,"Data:",data);
      skippedCount++;
      return;
    }
  })
  .on("end",async () => {
    console.log(
      `Loaded ${products.length} products from CSV. ` +
      `Skipped ${skippedCount} products.`
    );

    if(products.length===0){
      console.log("no products inserted into db");
      await prisma.$disconnect();
      process.exit(0);
    }

    try{
      console.log("bulk write with prisma");

      const result = await prisma.product.createMany({
        data:products
      });

      console.log(`Inserted ${result.count} products`);

    }catch(dbError){
      console.log("bulk write failed",dbError);
    }finally{
      await prisma.$disconnect();
      process.exit(0);
    }
  })
  .on("error",async(error)=>{
    console.error("CSV read error:",error);
    await prisma.$disconnect();
    process.exit(1);
  });