"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Koa API",
        version: "1.0.0",
        description: "API documentation",
    },
    servers: [
        {
            url: process.env.DOMAIN,
            description: "Development Server",
        },
    ],
};
const options = {
    swaggerDefinition,
    apis: ["./src/router/**/*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
