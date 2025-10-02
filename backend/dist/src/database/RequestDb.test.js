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
const RequestDb_1 = __importDefault(require("@/database/RequestDb"));
const helpers_1 = require("@/helpers");
const Request_1 = __importDefault(require("@/models/Request"));
jest.mock("@/models/Request", () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
}));
const requestDb = new RequestDb_1.default();
describe("RequestDb", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should get my schedule", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockSchedule = [{ staffId: 1, requestId: 1 }];
        Request_1.default.find.mockResolvedValue(mockSchedule);
        const result = yield requestDb.getMySchedule(1);
        expect(result).toEqual(mockSchedule);
        expect(Request_1.default.find).toHaveBeenCalledWith({ staffId: 1 }, "-_id -updatedAt");
    }));
    it("should get all subordinates requests", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockSubordinatesRequests = [{ staffId: 1, requestId: 1 }];
        Request_1.default.find.mockResolvedValue(mockSubordinatesRequests);
        const result = yield requestDb.getAllSubordinatesRequests(1);
        expect(result).toEqual(mockSubordinatesRequests);
        expect(Request_1.default.find).toHaveBeenCalledWith({ reportingManager: 1 });
    }));
    it("should get own pending requests", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockPendingRequests = [
            { staffId: 1, requestId: 1, status: helpers_1.Status.PENDING },
        ];
        Request_1.default.find.mockResolvedValue(mockPendingRequests);
        const result = yield requestDb.getOwnPendingRequests(1);
        expect(result).toEqual(mockPendingRequests);
        expect(Request_1.default.find).toHaveBeenCalledWith({
            staffId: 1,
            status: helpers_1.Status.PENDING,
        });
    }));
    it("should update request initiated withdrawal value", () => __awaiter(void 0, void 0, void 0, function* () {
        Request_1.default.updateOne.mockResolvedValue({ modifiedCount: 1 });
        const result = yield requestDb.updateRequestinitiatedWithdrawalValue(1);
        expect(result).toBe(true);
        expect(Request_1.default.updateOne).toHaveBeenCalledWith({ requestId: 1, initiatedWithdrawal: false }, { $set: { initiatedWithdrawal: true } });
    }));
    it("should cancel pending requests and return updated documents", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUpdatedRequests = [
            { staffId: 1, requestId: 1, status: helpers_1.Status.CANCELLED },
        ];
        Request_1.default.updateMany.mockResolvedValue({ modifiedCount: 1 });
        Request_1.default.find.mockResolvedValue(mockUpdatedRequests);
        const result = yield requestDb.cancelPendingRequests(1, 1);
        expect(result).toEqual(mockUpdatedRequests);
        expect(Request_1.default.updateMany).toHaveBeenCalledWith({ staffId: 1, requestId: 1, status: helpers_1.Status.PENDING }, { $set: { status: helpers_1.Status.CANCELLED } });
        expect(Request_1.default.find).toHaveBeenCalledWith({
            staffId: 1,
            requestId: 1,
            status: helpers_1.Status.CANCELLED,
        });
    }));
    it("should return null if no pending requests to cancel", () => __awaiter(void 0, void 0, void 0, function* () {
        Request_1.default.updateMany.mockResolvedValue({ modifiedCount: 0 });
        const result = yield requestDb.cancelPendingRequests(1, 1);
        expect(result).toBeNull();
    }));
    it("should get pending or approved requests", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequests = [
            { staffId: 1, requestId: 1, status: helpers_1.Status.APPROVED },
        ];
        Request_1.default.find.mockResolvedValue(mockRequests);
        const result = yield requestDb.getPendingOrApprovedRequests(1);
        expect(result).toEqual(mockRequests);
        expect(Request_1.default.find).toHaveBeenCalledWith({
            staffId: 1,
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
    }));
    it("should get team schedule", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockTeamSchedule = [{ staffId: 1, requestId: 1 }];
        Request_1.default.find.mockResolvedValue(mockTeamSchedule);
        const result = yield requestDb.getTeamSchedule(1, "Manager");
        expect(result).toEqual(mockTeamSchedule);
        expect(Request_1.default.find).toHaveBeenCalledWith({ reportingManager: 1, position: "Manager", status: helpers_1.Status.APPROVED }, "-_id -createdAt -updatedAt");
    }));
    it("should get all department schedule", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockDeptSchedule = [
            { dept: "HR", requests: [{ staffId: 1, requestId: 1 }] },
        ];
        Request_1.default.aggregate.mockResolvedValue(mockDeptSchedule);
        const result = yield requestDb.getAllDeptSchedule();
        expect(result).toEqual({ HR: [{ staffId: 1, requestId: 1 }] });
        expect(Request_1.default.aggregate).toHaveBeenCalledWith([
            { $match: { status: helpers_1.Status.APPROVED } },
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
            { $group: { _id: "$dept", requests: { $push: "$$ROOT" } } },
            { $project: { _id: 0, dept: "$_id", requests: 1 } },
        ]);
    }));
    it("should post a request", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockDocument = {
            staffId: 1,
            staffName: "John Doe",
            reportingManager: 2,
            managerName: "Jane Doe",
            dept: "HR",
            requestedDate: new Date(),
            requestType: helpers_1.RequestType.FULL,
            reason: "Sick",
            position: "Manager",
        };
        Request_1.default.create.mockResolvedValue({ requestId: 1 });
        const result = yield requestDb.postRequest(mockDocument);
        expect(result).toBe(1);
        expect(Request_1.default.create).toHaveBeenCalledWith(mockDocument);
    }));
    it("should return false on post request error", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockDocument = {
            staffId: 1,
            staffName: "John Doe",
            reportingManager: 2,
            managerName: "Jane Doe",
            dept: "HR",
            requestedDate: new Date(),
            requestType: helpers_1.RequestType.FULL,
            reason: "Sick",
            position: "Manager",
        };
        Request_1.default.create.mockRejectedValue(new Error("Error"));
        const result = yield requestDb.postRequest(mockDocument);
        expect(result).toBe(false);
    }));
    it("should approve request", () => __awaiter(void 0, void 0, void 0, function* () {
        Request_1.default.updateMany.mockResolvedValue({ modifiedCount: 1 });
        const result = yield requestDb.approveRequest(1);
        expect(result).toBe(helpers_1.HttpStatusResponse.OK);
        expect(Request_1.default.updateMany).toHaveBeenCalledWith({ requestId: 1, status: helpers_1.Status.PENDING }, { $set: { status: helpers_1.Status.APPROVED } });
    }));
    it("should return null if no request was approved", () => __awaiter(void 0, void 0, void 0, function* () {
        Request_1.default.updateMany.mockResolvedValue({ modifiedCount: 0 });
        const result = yield requestDb.approveRequest(1);
        expect(result).toBeNull();
    }));
    it("should get pending request by requestId", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequest = { requestId: 1, status: helpers_1.Status.PENDING };
        Request_1.default.findOne.mockResolvedValue(mockRequest);
        const result = yield requestDb.getPendingRequestByRequestId(1);
        expect(result).toEqual(mockRequest);
        expect(Request_1.default.findOne).toHaveBeenCalledWith({ requestId: 1, status: helpers_1.Status.PENDING }, "-_id -createdAt -updatedAt");
    }));
    it("should reject request", () => __awaiter(void 0, void 0, void 0, function* () {
        Request_1.default.updateMany.mockResolvedValue({ modifiedCount: 1 });
        const result = yield requestDb.rejectRequest(1, "No longer needed");
        expect(result).toBe(helpers_1.HttpStatusResponse.OK);
        expect(Request_1.default.updateMany).toHaveBeenCalledWith({ requestId: 1, status: helpers_1.Status.PENDING }, { $set: { status: helpers_1.Status.REJECTED, reason: "No longer needed" } });
    }));
    it("should return null if no request was rejected", () => __awaiter(void 0, void 0, void 0, function* () {
        Request_1.default.updateMany.mockResolvedValue({ modifiedCount: 0 });
        const result = yield requestDb.rejectRequest(1, "No longer needed");
        expect(result).toBeNull();
    }));
    it("should get approved request by requestId", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequest = { requestId: 1, status: helpers_1.Status.APPROVED };
        Request_1.default.findOne.mockResolvedValue(mockRequest);
        const result = yield requestDb.getApprovedRequestByRequestId(1);
        expect(result).toEqual(mockRequest);
        expect(Request_1.default.findOne).toHaveBeenCalledWith({ requestId: 1, status: helpers_1.Status.APPROVED }, "-_id -createdAt -updatedAt");
    }));
    it("should revoke request", () => __awaiter(void 0, void 0, void 0, function* () {
        Request_1.default.updateMany.mockResolvedValue({ modifiedCount: 1 });
        const result = yield requestDb.revokeRequest(1, "Changed my mind");
        expect(result).toBe(helpers_1.HttpStatusResponse.OK);
        expect(Request_1.default.updateMany).toHaveBeenCalledWith({ requestId: 1, status: helpers_1.Status.APPROVED }, { $set: { status: helpers_1.Status.REVOKED, reason: "Changed my mind" } });
    }));
    it("should return null if no request was revoked", () => __awaiter(void 0, void 0, void 0, function* () {
        Request_1.default.updateMany.mockResolvedValue({ modifiedCount: 0 });
        const result = yield requestDb.revokeRequest(1, "Changed my mind");
        expect(result).toBeNull();
    }));
    it("should set withdrawn status", () => __awaiter(void 0, void 0, void 0, function* () {
        Request_1.default.updateMany.mockResolvedValue({ modifiedCount: 1 });
        const result = yield requestDb.setWithdrawnStatus(1);
        expect(result).toBe(helpers_1.HttpStatusResponse.OK);
        expect(Request_1.default.updateMany).toHaveBeenCalledWith({ requestId: 1, status: helpers_1.Status.APPROVED }, { $set: { status: helpers_1.Status.WITHDRAWN } });
    }));
    it("should return null if no request was set to withdrawn", () => __awaiter(void 0, void 0, void 0, function* () {
        Request_1.default.updateMany.mockResolvedValue({ modifiedCount: 0 });
        const result = yield requestDb.setWithdrawnStatus(1);
        expect(result).toBeNull();
    }));
});
