import {prisma} from "../prisma/prismaClient";

interface SearchFilters{
    query?:string;
    category?:string;
    subcategory?:string;
    brand?:string;
    minPrice?:number;
    maxPrice?:number;
    minRating?:number;
    availability?:string;
    page?:number;
    pageSize?:number;
}

export async function getProducts(page: number=1, pageSize: number=20){
   const [products, total] = await Promise.all([
    prisma.product.findMany({
        skip: (page-1)* pageSize,
        take: pageSize
    }),
    prisma.product.count
   ]);

   return{
    page,
    pageSize,
    total,
    products
   };
}

export async function getProductBySku(skuId: string){
    return prisma.product.findUnique({
        where:{ skuId}
    });
}

export async function searchProducts(filters:SearchFilters){
    const{
        query,
        category,
        subcategory,
        brand,
        minPrice,
        maxPrice,
        minRating,
        availability,
        page=1,
        pageSize=20
    } = filters;

    const where:any = {};

    if(query){
    where.OR = [
      {
        name:{
          contains:query,
          mode:"insensitive"
        }
      },
      {
        description:{
          contains:query,
          mode:"insensitive"
        }
      },
      {
        searchKeywords:{
          contains:query,
          mode:"insensitive"
        }
      }
    ];
    }

    if(category){
        where.category = category;
    }

    if(subcategory){
        where.subcategory=subcategory;
    }

    if(brand){
        where.brand = brand;
    }

    if(minPrice || maxPrice){
        where.priceInr = {};
        if(minPrice){
            where.priceInr.gte=minPrice;
        }

        if(maxPrice){
            where.maxPrice.lte = maxPrice;
        }
    }

    if(minRating){
        where.rating = {
            gte:minRating
        };
    }

    if(availability){
        where.availability = availability;
    }

    const [products,total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip: (page-1)*pageSize,
            take:pageSize
        }),
        prisma.product.count({
            where
        })
    ]);

    return{
        page,
        pageSize,
        total,
        products
    }
}

export async function keywordSearch(query: string){
    return prisma.product.findMany({
        where:{
            OR:[
                {
                    name:{
                        contains: query,
                        mode: "insensitive"
                    }
                },
                {
                    description:{
                        contains: query,
                        mode: "insensitive"
                    }
                },
                {
                    searchKeywords:{
                        contains: query,
                        mode: "insensitive"
                    }
                }
            ]
        },
        take:20
    });
}