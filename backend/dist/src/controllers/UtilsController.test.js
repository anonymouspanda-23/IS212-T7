"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UtilsController_1 = __importDefault(require("./UtilsController"));
describe("UtilsController", () => {
    let ctx;
    beforeEach(() => {
        ctx = {
            body: {},
        };
    });
    it("should set the error message in ctx.body", () => {
        const errorMessage = "Some error occurred"; // Use an appropriate error message
        UtilsController_1.default.throwAPIError(ctx, errorMessage);
        expect(ctx.body).toEqual({ error: errorMessage });
    });
});
