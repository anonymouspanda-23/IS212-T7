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
const Reassignment_1 = __importDefault(require("@/models/Reassignment"));
const dayjs_1 = __importDefault(require("dayjs"));
class ReassignmentDb {
    setActiveReassignmentPeriod() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = (0, dayjs_1.default)().utc(true).startOf("day");
            const { modifiedCount } = yield Reassignment_1.default.updateMany({
                startDate: { $eq: now.toDate() },
            }, {
                $set: {
                    active: true,
                },
            });
            return modifiedCount > 0;
        });
    }
    setInactiveReassignmentPeriod() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = (0, dayjs_1.default)().utc(true).startOf("day");
            const { modifiedCount } = yield Reassignment_1.default.updateMany({
                endDate: { $lt: now.toDate() },
            }, {
                $set: {
                    active: false,
                },
            });
            return modifiedCount > 0;
        });
    }
    insertReassignmentRequest(reassignmentRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Reassignment_1.default.create(reassignmentRequest);
        });
    }
    getReassignmentRequest(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reassignmentRequest = yield Reassignment_1.default.find({
                staffId,
            }, "-_id -createdAt -updatedAt");
            return reassignmentRequest;
        });
    }
    getTempMgrReassignmentRequest(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reassignmentRequest = yield Reassignment_1.default.find({
                tempReportingManagerId: staffId,
            }, "-_id -createdAt -updatedAt");
            return reassignmentRequest;
        });
    }
    getReassignmentActive(staffId, tempReportingManagerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reassignmentRequest = yield Reassignment_1.default.findOne({
                staffId,
                tempReportingManagerId,
                active: true,
            }, "-_id -createdAt -updatedAt");
            return reassignmentRequest;
        });
    }
    hasNonRejectedReassignment(staffId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasNonRejectedReassignment = yield Reassignment_1.default.exists({
                staffId,
                status: { $ne: helpers_1.Status.REJECTED },
                $or: [
                    {
                        startDate: { $lte: endDate, $gte: startDate },
                    },
                    {
                        endDate: { $gte: startDate, $lte: endDate },
                    },
                    {
                        startDate: { $lte: startDate },
                        endDate: { $gte: endDate },
                    },
                ],
            });
            return !!hasNonRejectedReassignment;
        });
    }
    getActiveReassignmentAsTempManager(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reassignmentRequest = yield Reassignment_1.default.findOne({
                tempReportingManagerId: staffId,
                active: true,
            }, "-_id -createdAt -updatedAt");
            return reassignmentRequest;
        });
    }
    getIncomingReassignmentRequests(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const incomingRequests = yield Reassignment_1.default.find({
                tempReportingManagerId: staffId,
                status: helpers_1.Status.PENDING,
            })
                .select("-_id")
                .lean();
            return incomingRequests;
        });
    }
    updateReassignmentStatus(reassignmentId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return Reassignment_1.default.findOneAndUpdate({ reassignmentId }, { $set: { status } }, { new: true }).lean();
        });
    }
}
exports.default = ReassignmentDb;
