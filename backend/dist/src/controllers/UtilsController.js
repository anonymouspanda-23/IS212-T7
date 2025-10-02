"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UtilsController {
    static throwAPIError(ctx, errorMessage) {
        ctx.body = { error: errorMessage };
    }
}
exports.default = UtilsController;
