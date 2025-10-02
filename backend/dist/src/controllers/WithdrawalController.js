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
const UtilsController_1 = __importDefault(require("@/controllers/UtilsController"));
const helpers_1 = require("@/helpers");
const schema_1 = require("@/schema");
class WithdrawalController {
    constructor(withdrawalService) {
        this.withdrawalService = withdrawalService;
    }
    withdrawRequest(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { requestId } = ctx.request.body;
            if (!requestId) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
            }
            const result = yield this.withdrawalService.withdrawRequest(Number(requestId));
            ctx.body =
                result == helpers_1.HttpStatusResponse.OK
                    ? helpers_1.HttpStatusResponse.OK
                    : helpers_1.HttpStatusResponse.NOT_MODIFIED;
        });
    }
    getSubordinatesWithdrawalRequests(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = ctx.request.header;
            if (!id) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
            }
            const subordinatesRequests = yield this.withdrawalService.getSubordinatesWithdrawalRequests(Number(id));
            ctx.body = subordinatesRequests;
        });
    }
    getOwnWithdrawalRequests(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { staffId } = ctx.query;
            if (!staffId) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
            }
            const ownRequests = yield this.withdrawalService.getOwnWithdrawalRequests(Number(staffId));
            ctx.body = ownRequests;
        });
    }
    approveWithdrawalRequest(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const approvalDetails = ctx.request.body;
            const validation = schema_1.withdrawalApprovalSchema.safeParse(approvalDetails);
            if (!validation.success) {
                ctx.body = {
                    errMsg: validation.error.format(),
                };
                return;
            }
            const { performedBy, withdrawalId } = ctx.request.body;
            const result = yield this.withdrawalService.approveWithdrawalRequest(Number(performedBy), Number(withdrawalId));
            ctx.body =
                result == helpers_1.HttpStatusResponse.OK
                    ? helpers_1.HttpStatusResponse.OK
                    : helpers_1.HttpStatusResponse.NOT_MODIFIED;
        });
    }
    rejectWithdrawalRequest(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const rejectionDetails = ctx.request.body;
            const validation = schema_1.withdrawalRejectionSchema.safeParse(rejectionDetails);
            if (!validation.success) {
                ctx.body = {
                    errMsg: validation.error.format(),
                };
                return;
            }
            const { performedBy, withdrawalId, reason } = ctx.request.body;
            const result = yield this.withdrawalService.rejectWithdrawalRequest(Number(performedBy), Number(withdrawalId), reason);
            ctx.body =
                result == helpers_1.HttpStatusResponse.OK
                    ? helpers_1.HttpStatusResponse.OK
                    : helpers_1.HttpStatusResponse.NOT_MODIFIED;
        });
    }
}
exports.default = WithdrawalController;
