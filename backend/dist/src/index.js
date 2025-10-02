"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("module-alias/register");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("@koa/cors"));
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const router_1 = __importDefault(require("./router"));
require("reflect-metadata");
const app = new koa_1.default();
exports.app = app;
app.use((0, cors_1.default)());
app.use((0, koa_bodyparser_1.default)());
app.use(router_1.default.routes());
