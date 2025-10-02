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
const schema_1 = require("@/schema");
const UtilsController_1 = __importDefault(require("./UtilsController"));
class ReassignmentController {
    constructor(reassignmentService) {
        this.getSubordinateRequestsForTempManager = (ctx) => __awaiter(this, void 0, void 0, function* () {
            const { id } = ctx.request.header;
            if (!id) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_HEADER);
            }
            const sanitisedStaffId = schema_1.numberSchema.parse(id);
            try {
                const subordinateRequests = yield this.reassignmentService.getSubordinateRequestsForTempManager(sanitisedStaffId);
                if (subordinateRequests === null) {
                    ctx.status = 404;
                    ctx.body = { error: helpers_1.errMsg.NO_ACTIVE_REASSIGNMENT };
                    return;
                }
                ctx.body = subordinateRequests;
            }
            catch (error) {
                ctx.status = 500;
                ctx.body = { error: helpers_1.errMsg.GENERIC_ERROR };
            }
        });
        this.reassignmentService = reassignmentService;
    }
    insertReassignmentRequest(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const reassignmentRequest = ctx.request.body;
            const validBody = schema_1.reassignmentRequestSchema.safeParse(reassignmentRequest);
            if (!validBody.success) {
                ctx.body = {
                    errMsg: validBody.error.format(),
                };
                return;
            }
            const result = yield this.reassignmentService.insertReassignmentRequest(reassignmentRequest);
            switch (result) {
                case helpers_1.errMsg.NON_REJECTED_REASSIGNMENT:
                    ctx.body = { errMsg: helpers_1.errMsg.NON_REJECTED_REASSIGNMENT };
                    break;
                case helpers_1.errMsg.PAST_DATE_NOT_ALLOWED:
                    ctx.body = { errMsg: helpers_1.errMsg.PAST_DATE_NOT_ALLOWED };
                    break;
                case helpers_1.errMsg.CURRENT_DATE_NOT_ALLOWED:
                    ctx.body = { errMsg: helpers_1.errMsg.CURRENT_DATE_NOT_ALLOWED };
                    break;
                case helpers_1.errMsg.SAME_ROLE_REASSIGNMENT:
                    ctx.body = { errMsg: helpers_1.errMsg.SAME_ROLE_REASSIGNMENT };
                    break;
                default:
                    ctx.body = helpers_1.HttpStatusResponse.OK;
                    break;
            }
        });
    }
    getReassignmentStatus(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = ctx.request.header;
            if (!id) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_HEADER);
            }
            const sanitisedStaffId = schema_1.numberSchema.parse(id);
            const reassignmentReq = yield this.reassignmentService.getReassignmentStatus(sanitisedStaffId);
            ctx.body = reassignmentReq;
        });
    }
    getTempMgrReassignmentStatus(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = ctx.request.header;
            if (!id) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_HEADER);
            }
            const sanitisedStaffId = schema_1.numberSchema.parse(id);
            const reassignmentReq = yield this.reassignmentService.getTempMgrReassignmentStatus(sanitisedStaffId);
            ctx.body = reassignmentReq;
        });
    }
    getIncomingReassignmentRequests(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = ctx.request.header;
            if (!id) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_HEADER);
            }
            const sanitisedStaffId = schema_1.numberSchema.parse(id);
            const incomingRequests = yield this.reassignmentService.getIncomingReassignmentRequests(sanitisedStaffId);
            ctx.body = incomingRequests;
        });
    }
    handleReassignmentRequest(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: staffId } = ctx.request.header;
            const { reassignmentId, action } = ctx.request.body;
            if (!staffId) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_HEADER);
            }
            if (!reassignmentId || !action) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
            }
            const sanitisedStaffId = schema_1.numberSchema.parse(staffId.toString());
            const sanitisedReassignmentId = schema_1.numberSchema.parse(reassignmentId.toString());
            if (action !== helpers_1.Action.APPROVE && action !== helpers_1.Action.REJECT) {
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.INVALID_ACTION);
            }
            try {
                yield this.reassignmentService.handleReassignmentRequest(sanitisedStaffId, sanitisedReassignmentId, action);
                ctx.body = helpers_1.HttpStatusResponse.OK;
            }
            catch (error) {
                ctx.status = 400;
                ctx.body = { error: helpers_1.errMsg.GENERIC_ERROR };
            }
        });
    }
}
exports.default = ReassignmentController;
