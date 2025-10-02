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
class RequestController {
    constructor(requestService) {
        this.requestService = requestService;
    }
    cancelPendingRequests(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { staffId, requestId } = ctx.request.body;
            const result = yield this.requestService.cancelPendingRequests(Number(staffId), Number(requestId));
            ctx.body =
                result == helpers_1.HttpStatusResponse.OK
                    ? helpers_1.HttpStatusResponse.OK
                    : helpers_1.HttpStatusResponse.NOT_MODIFIED;
        });
    }
    getAllSubordinatesRequests(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = ctx.request.header;
            const subordinatesRequests = yield this.requestService.getAllSubordinatesRequests(Number(id));
            ctx.body = subordinatesRequests;
        });
    }
    getOwnPendingRequests(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { myId } = ctx.query;
            if (!myId) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
            }
            const pendingRequests = yield this.requestService.getOwnPendingRequests(Number(myId));
            ctx.body = pendingRequests;
        });
    }
    getMySchedule(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { myId } = ctx.query;
            if (!myId) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
            }
            const result = yield this.requestService.getMySchedule(Number(myId));
            ctx.body = result;
        });
    }
    getSchedule(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = ctx.request.header;
            const validation = schema_1.staffIdSchema.safeParse({ id });
            if (!validation.success) {
                ctx.body = {
                    errMsg: validation.error.format(),
                };
                return;
            }
            const result = yield this.requestService.getSchedule(Number(id));
            ctx.body = result;
        });
    }
    postRequest(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestDetails = ctx.request.body;
            const validation = schema_1.requestSchema.safeParse(requestDetails);
            if (!validation.success) {
                ctx.body = {
                    errMsg: validation.error.format(),
                };
                return;
            }
            const result = yield this.requestService.postRequest(requestDetails);
            let responseMessage = {
                success: { message: "", dates: [] },
                error: [],
                note: { message: "", dates: [] },
            };
            if (result.successDates.length > 0) {
                responseMessage.success = {
                    message: helpers_1.successMsg,
                    dates: result.successDates,
                };
            }
            if (result.weekendDates.length > 0) {
                responseMessage.error.push({
                    message: helpers_1.errMsg.WEEKEND_REQUEST,
                    dates: result.weekendDates,
                });
            }
            if (result.pastDates.length > 0) {
                responseMessage.error.push({
                    message: helpers_1.errMsg.PAST_DATE,
                    dates: result.pastDates,
                });
            }
            if (result.pastDeadlineDates.length > 0) {
                responseMessage.error.push({
                    message: helpers_1.errMsg.PAST_DEADLINE,
                    dates: result.pastDeadlineDates,
                });
            }
            if (result.errorDates.length > 0) {
                responseMessage.error.push({
                    message: helpers_1.errMsg.SAME_DAY_REQUEST,
                    dates: result.errorDates,
                });
            }
            if (result.duplicateDates.length > 0) {
                responseMessage.error.push({
                    message: helpers_1.errMsg.DUPLICATE_DATE,
                    dates: result.duplicateDates,
                });
            }
            if (result.insertErrorDates.length > 0) {
                responseMessage.error.push({
                    message: helpers_1.errMsg.INSERT_ERROR,
                    dates: result.insertErrorDates,
                });
            }
            if (result.noteDates.length > 0) {
                responseMessage.note = {
                    message: helpers_1.noteMsg,
                    dates: result.noteDates,
                };
            }
            ctx.body = responseMessage;
        });
    }
    approveRequest(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const approvalDetails = ctx.request.body;
            const validation = schema_1.approvalSchema.safeParse(approvalDetails);
            if (!validation.success) {
                ctx.body = {
                    errMsg: validation.error.format(),
                };
                return;
            }
            const { performedBy, requestId } = ctx.request.body;
            const result = yield this.requestService.approveRequest(Number(performedBy), Number(requestId));
            ctx.body =
                result == helpers_1.HttpStatusResponse.OK
                    ? helpers_1.HttpStatusResponse.OK
                    : helpers_1.HttpStatusResponse.NOT_MODIFIED;
        });
    }
    rejectRequest(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const rejectionDetails = ctx.request.body;
            const validation = schema_1.rejectionSchema.safeParse(rejectionDetails);
            if (!validation.success) {
                ctx.body = {
                    errMsg: validation.error.format(),
                };
                return;
            }
            const { performedBy, requestId, reason } = rejectionDetails;
            const result = yield this.requestService.rejectRequest(Number(performedBy), Number(requestId), reason);
            ctx.body =
                result == helpers_1.HttpStatusResponse.OK
                    ? helpers_1.HttpStatusResponse.OK
                    : helpers_1.HttpStatusResponse.NOT_MODIFIED;
        });
    }
    revokeRequest(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const revocationDetails = ctx.request.body;
            const validation = schema_1.revocationSchema.safeParse(revocationDetails);
            if (!validation.success) {
                ctx.body = {
                    errMsg: validation.error.format(),
                };
                return;
            }
            const { performedBy, requestId, reason } = revocationDetails;
            const result = yield this.requestService.revokeRequest(Number(performedBy), Number(requestId), reason);
            ctx.body =
                result == helpers_1.HttpStatusResponse.OK
                    ? helpers_1.HttpStatusResponse.OK
                    : helpers_1.HttpStatusResponse.NOT_MODIFIED;
        });
    }
}
exports.default = RequestController;
