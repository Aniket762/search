import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finfully Search",
      version: "1.0.0",
      description: "swagger configured for easy api testing",
    },
    servers: [
      {
        url: "http://localhost:8082",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/**/*.ts", "./src/**/*.js"], 
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

}