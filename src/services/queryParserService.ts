import axios from "axios";

export interface ParsedSearchQuery{
    category?:string;
    subcategory?:string;
    brand?:string;
    color?:string;
    room?:string;
    minPrice?:number;
    maxPrice?:number;
    availability?:string;
    searchText?:string;
    confidence?:number;
}

export async function pareseNaturalLanguageQuery(query:string):Promise<ParsedSearchQuery>{
    const prompt = `
        You are an ecommerce product search query parser.

        Your task is to convert a natural language search query into structured filters.

        Dataset Fields:

        product_id:
        Base product identifier.

        sku_id:
        Unique SKU identifier.

        name:
        Readable product name.

        category:
        High-level product category.

        subcategory:
        More specific product grouping.

        brand:
        Brand/vendor code.

        price_inr:
        Retail price used for filtering.

        rating:
        Product rating.

        review_count:
        Number of reviews.

        inventory_count:
        Available inventory.

        availability:
        One of:
        - in_stock
        - low_stock
        - out_of_stock

        is_active:
        Whether product is active.

        catalog_status:
        Current or non-current catalog product.

        color:
        Product color.

        material:
        Product material.

        room:
        Intended room or use case.

        style:
        Interior style.

        unit:
        Unit of measure.

        description:
        Product description.

        search_keywords:
        Expanded keywords and synonyms.

        Rules:

        1. Extract only information explicitly present in the query.
        2. Do not invent filters.
        3. If a field is not present, omit it.
        4. Return ONLY valid JSON.
        5. confidence must be between 0 and 1.
        6. searchText should contain the remaining semantic intent not captured by filters.
        7. Return ONLY raw JSON. Do not wrap in markdown code blocks.

        Examples:

        User:
        modern grey sofa for living room

        Output:
        {
        "category":"Sofa",
        "color":"Grey",
        "room":"Living Room",
        "searchText":"modern sofa",
        "confidence":0.95
        }

        User:
        budget curtain fabric under 500 for bedroom

        Output:
        {
        "category":"Fabric",
        "subcategory":"Curtain Fabric",
        "maxPrice":500,
        "room":"Bedroom",
        "searchText":"budget curtain fabric",
        "confidence":0.96
        }

        User:
        products from brand FFPL under 10000

        Output:
        {
        "brand":"FFPL",
        "maxPrice":10000,
        "confidence":0.99
        }

        User:
        office chair for long sitting

        Output:
        {
        "category":"Accent Chair",
        "room":"Office",
        "searchText":"comfortable chair for long sitting",
        "confidence":0.85
        }

        User Query:
        ${query}
        `;

    const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            model:"google/gemini-2.5-flash",
            temperature:0,
            messages:[
                {
                    role:"user",
                    content:prompt
                }
            ]
        },
        {
            headers:{
                Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type":"application/json"
            }
        }
    );

    const content = response.data.choices[0].message.content;

    const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

    return JSON.parse(cleaned);
}