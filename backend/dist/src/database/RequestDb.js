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
const Request_1 = __importDefault(require("@/models/Request"));
const dayjs_1 = __importDefault(require("dayjs"));
class RequestDb {
    getMySchedule(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield Request_1.default.find({ staffId: myId }, "-_id -updatedAt");
            return schedule;
        });
    }
    getAllSubordinatesRequests(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subordinatesRequests = yield Request_1.default.find({
                reportingManager: staffId,
            });
            return subordinatesRequests;
        });
    }
    getOwnPendingRequests(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingRequests = yield Request_1.default.find({
                staffId: myId,
                status: helpers_1.Status.PENDING,
            });
            return pendingRequests;
        });
    }
    updateRequestinitiatedWithdrawalValue(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modifiedCount } = yield Request_1.default.updateOne({ requestId, initiatedWithdrawal: false }, { $set: { initiatedWithdrawal: true } });
            return modifiedCount > 0;
        });
    }
    cancelPendingRequests(staffId, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modifiedCount } = yield Request_1.default.updateMany({
                staffId,
                requestId,
                status: helpers_1.Status.PENDING,
            }, {
                $set: {
                    status: helpers_1.Status.CANCELLED,
                },
            });
            if (modifiedCount == 0) {
                return null;
            }
            const updatedRequests = yield Request_1.default.find({
                staffId,
                requestId,
                status: helpers_1.Status.CANCELLED,
            });
            return updatedRequests;
        });
    }
    getPendingOrApprovedRequests(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield Request_1.default.find({
                staffId: myId,
                status: {
                    $nin: [
                        helpers_1.Status.CANCELLED,
                        helpers_1.Status.WITHDRAWN,
                        helpers_1.Status.REJECTED,
                        helpers_1.Status.EXPIRED,
                        helpers_1.Status.REVOKED,
                    ],
                },
            });
            return schedule;
        });
    }
    getTeamSchedule(reportingManager, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamSchedule = yield Request_1.default.find({
                reportingManager,
                position,
                status: helpers_1.Status.APPROVED,
            }, "-_id -createdAt -updatedAt");
            return teamSchedule;
        });
    }
    getAllDeptSchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            const deptSchedule = yield Request_1.default.aggregate([
                {
                    $match: {
                        status: helpers_1.Status.APPROVED,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        staffId: 1,
                        staffName: 1,
                        reportingManager: 1,
                        managerName: 1,
                        dept: 1,
                        requestedDate: 1,
                        requestType: 1,
                        position: 1,
                        reason: 1,
                        status: 1,
                        requestId: 1,
                    },
                },
                {
                    $group: {
                        _id: "$dept",
                        requests: { $push: "$$ROOT" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dept: "$_id",
                        requests: 1,
                    },
                },
            ]);
            const formattedSchedule = deptSchedule.reduce((acc, dept) => {
                acc[dept.dept] = dept.requests;
                return acc;
            }, {});
            return formattedSchedule;
        });
    }
    postRequest(document) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { requestId } = yield Request_1.default.create(document);
                return requestId;
            }
            catch (error) {
                return false;
            }
        });
    }
    updateRequestStatusToExpired() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = (0, dayjs_1.default)().utc(true).startOf("day");
            const requests = yield Request_1.default.find({
                status: helpers_1.Status.PENDING,
                requestedDate: now.toDate(),
            });
            if (!requests.length)
                return [];
            yield Request_1.default.updateMany({
                status: helpers_1.Status.PENDING,
                requestedDate: now.toDate(),
            }, {
                $set: {
                    status: helpers_1.Status.EXPIRED,
                },
            });
            return requests;
        });
    }
    approveRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modifiedCount } = yield Request_1.default.updateMany({
                requestId,
                status: helpers_1.Status.PENDING,
            }, {
                $set: {
                    status: helpers_1.Status.APPROVED,
                },
            });
            if (modifiedCount == 0) {
                return null;
            }
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    getPendingRequestByRequestId(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestDetail = yield Request_1.default.findOne({
                requestId,
                status: helpers_1.Status.PENDING,
            }, "-_id -createdAt -updatedAt");
            return requestDetail;
        });
    }
    rejectRequest(requestId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modifiedCount } = yield Request_1.default.updateMany({
                requestId,
                status: helpers_1.Status.PENDING,
            }, {
                $set: {
                    status: helpers_1.Status.REJECTED,
                    reason: reason,
                },
            });
            if (modifiedCount == 0) {
                return null;
            }
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    getApprovedRequestByRequestId(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestDetail = yield Request_1.default.findOne({
                requestId,
                status: helpers_1.Status.APPROVED,
            }, "-_id -createdAt -updatedAt");
            return requestDetail;
        });
    }
    revokeRequest(requestId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modifiedCount } = yield Request_1.default.updateMany({
                requestId,
                status: helpers_1.Status.APPROVED,
            }, {
                $set: {
                    status: helpers_1.Status.REVOKED,
                    reason: reason,
                },
            });
            if (modifiedCount == 0) {
                return null;
            }
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    setWithdrawnStatus(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modifiedCount } = yield Request_1.default.updateMany({
                requestId,
                status: helpers_1.Status.APPROVED,
            }, {
                $set: {
                    status: helpers_1.Status.WITHDRAWN,
                },
            });
            if (modifiedCount == 0) {
                return null;
            }
            return helpers_1.HttpStatusResponse.OK;
        });
    }
}
exports.default = RequestDb;
