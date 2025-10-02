"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalRejectionSchema = exports.withdrawalApprovalSchema = exports.revocationSchema = exports.staffIdSchema = exports.requestSchema = exports.rejectionSchema = exports.reassignmentRequestSchema = exports.numberSchema = exports.approvalSchema = void 0;
const zod_1 = require("zod");
const staffIdSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.staffIdSchema = staffIdSchema;
const numberSchema = zod_1.z.string().transform((val) => {
    const number = Number(val);
    if (isNaN(number)) {
        throw new Error("Invalid Number");
    }
    return number;
});
exports.numberSchema = numberSchema;
const requestSchema = zod_1.z.object({
    staffId: zod_1.z.number(),
    requestedDates: zod_1.z.array(zod_1.z.tuple([zod_1.z.string(), zod_1.z.string()])),
    reason: zod_1.z.string(),
});
exports.requestSchema = requestSchema;
const approvalSchema = zod_1.z.object({
    performedBy: zod_1.z.number(),
    requestId: zod_1.z.number(),
});
exports.approvalSchema = approvalSchema;
const rejectionSchema = zod_1.z.object({
    performedBy: zod_1.z.number(),
    requestId: zod_1.z.number(),
    reason: zod_1.z.string(),
});
exports.rejectionSchema = rejectionSchema;
const reassignmentRequestSchema = zod_1.z.object({
    staffId: zod_1.z.number(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    tempReportingManagerId: zod_1.z.number(),
});
exports.reassignmentRequestSchema = reassignmentRequestSchema;
const revocationSchema = zod_1.z.object({
    performedBy: zod_1.z.number(),
    requestId: zod_1.z.number(),
    reason: zod_1.z.string(),
});
exports.revocationSchema = revocationSchema;
const withdrawalApprovalSchema = zod_1.z.object({
    performedBy: zod_1.z.number(),
    withdrawalId: zod_1.z.number(),
});
exports.withdrawalApprovalSchema = withdrawalApprovalSchema;
const withdrawalRejectionSchema = zod_1.z.object({
    performedBy: zod_1.z.number(),
    withdrawalId: zod_1.z.number(),
    reason: zod_1.z.string(),
});
exports.withdrawalRejectionSchema = withdrawalRejectionSchema;
