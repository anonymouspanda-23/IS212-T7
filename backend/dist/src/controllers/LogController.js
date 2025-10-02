"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("@/helpers");
const UtilsController_1 = __importDefault(require("./UtilsController"));
class LogController {
    constructor(logService) {
        this.logService = logService;
    }
    getAllLogs(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = ctx.request.header;
            if (!id) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_HEADER);
            }
            const result = yield this.logService.getAllLogs(Number(id));
            ctx.body = !result
                ? (ctx.body = { errMsg: helpers_1.errMsg.LOGS_NOT_FOUND })
                : result;
        });
    }
}
exports.default = LogController;
