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
const Withdrawal_1 = __importDefault(require("@/models/Withdrawal"));
const WithdrawalDb_1 = __importDefault(require("./WithdrawalDb"));
jest.mock("@/models/Withdrawal", () => ({
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    updateMany: jest.fn(),
}));
describe("WithdrawalDb", () => {
    let withdrawalDb;
    beforeEach(() => {
        withdrawalDb = new WithdrawalDb_1.default();
        jest.clearAllMocks();
    });
    describe("withdrawRequest", () => {
        it("should create a withdrawal request and return OK status", () => __awaiter(void 0, void 0, void 0, function* () {
            const document = {
                requestId: 1,
                staffId: 1,
                staffName: "John Doe",
                reportingManager: null,
                managerName: null,
                dept: "HR",
                position: "Manager",
                requestedDate: new Date(),
                requestType: "Annual Leave",
            };
            Withdrawal_1.default.create.mockResolvedValue(document);
            const result = yield withdrawalDb.withdrawRequest(document);
            expect(Withdrawal_1.default.create).toHaveBeenCalledWith(document);
            expect(result).toBe(helpers_1.HttpStatusResponse.OK);
        }));
        it("should return null if an error occurs during the creation", () => __awaiter(void 0, void 0, void 0, function* () {
            const document = {
                requestId: 1,
                staffId: 1,
                staffName: "John Doe",
                reportingManager: null,
                managerName: null,
                dept: "HR",
                position: "Manager",
                requestedDate: new Date(),
                requestType: "Annual Leave",
            };
            Withdrawal_1.default.create.mockRejectedValue(new Error("Error creating withdrawal"));
            const result = yield withdrawalDb.withdrawRequest(document);
            expect(Withdrawal_1.default.create).toHaveBeenCalledWith(document);
            expect(result).toBe(null);
        }));
    });
    describe("getWithdrawalRequest", () => {
        it("should return withdrawal requests for the given requestId", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockWithdrawalRequests = [
                {
                    withdrawalId: 1,
                    requestId: 1,
                    staffId: 1,
                    staffName: "John Doe",
                    reportingManager: null,
                    managerName: null,
                    dept: "HR",
                    position: "Manager",
                    requestedDate: new Date(),
                    requestType: "Annual Leave",
                    status: helpers_1.Status.PENDING,
                    reason: null,
                },
            ];
            Withdrawal_1.default.find.mockResolvedValue(mockWithdrawalRequests);
            const result = yield withdrawalDb.getWithdrawalRequest(1);
            expect(Withdrawal_1.default.find).toHaveBeenCalledWith({ requestId: 1 });
            expect(result).toEqual(mockWithdrawalRequests);
        }));
    });
    describe("getSubordinatesWithdrawalRequests", () => {
        it("should return withdrawal requests for the given reportingManager", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockWithdrawalRequests = [
                {
                    withdrawalId: 2,
                    requestId: 2,
                    staffId: 2,
                    staffName: "Jane Doe",
                    reportingManager: 1,
                    managerName: "Manager A",
                    dept: "HR",
                    position: "Manager",
                    requestedDate: new Date(),
                    requestType: "Sick Leave",
                    status: helpers_1.Status.PENDING,
                    reason: null,
                },
            ];
            Withdrawal_1.default.find.mockResolvedValue(mockWithdrawalRequests);
            const result = yield withdrawalDb.getSubordinatesWithdrawalRequests(1);
            expect(Withdrawal_1.default.find).toHaveBeenCalledWith({ reportingManager: 1 });
            expect(result).toEqual(mockWithdrawalRequests);
        }));
    });
    describe("getOwnWithdrawalRequests", () => {
        it("should return withdrawal requests for the given staffId", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockWithdrawalRequests = [
                {
                    withdrawalId: 3,
                    requestId: 3,
                    staffId: 1,
                    staffName: "John Doe",
                    reportingManager: null,
                    managerName: null,
                    dept: "HR",
                    position: "Manager",
                    requestedDate: new Date(),
                    requestType: "Annual Leave",
                    status: helpers_1.Status.PENDING,
                    reason: null,
                },
            ];
            Withdrawal_1.default.find.mockResolvedValue(mockWithdrawalRequests);
            const result = yield withdrawalDb.getOwnWithdrawalRequests(1);
            expect(Withdrawal_1.default.find).toHaveBeenCalledWith({ staffId: 1 });
            expect(result).toEqual(mockWithdrawalRequests);
        }));
    });
    describe("getWithdrawalRequestById", () => {
        it("should return a withdrawal request for the given withdrawalId", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockWithdrawalRequest = {
                withdrawalId: 1,
                requestId: 1,
                staffId: 1,
                staffName: "John Doe",
                reportingManager: null,
                managerName: null,
                dept: "HR",
                position: "Manager",
                requestedDate: new Date(),
                requestType: "Annual Leave",
                status: helpers_1.Status.PENDING,
                reason: null,
            };
            Withdrawal_1.default.findOne.mockResolvedValue(mockWithdrawalRequest);
            const result = yield withdrawalDb.getWithdrawalRequestById(1);
            expect(Withdrawal_1.default.findOne).toHaveBeenCalledWith({ withdrawalId: 1 });
            expect(result).toEqual(mockWithdrawalRequest);
        }));
        it("should return null if no withdrawal request is found", () => __awaiter(void 0, void 0, void 0, function* () {
            Withdrawal_1.default.findOne.mockResolvedValue(null);
            const result = yield withdrawalDb.getWithdrawalRequestById(999);
            expect(Withdrawal_1.default.findOne).toHaveBeenCalledWith({ withdrawalId: 999 });
            expect(result).toBeNull();
        }));
    });
    describe("approveWithdrawalRequest", () => {
        it("should approve a withdrawal request and return OK status", () => __awaiter(void 0, void 0, void 0, function* () {
            Withdrawal_1.default.updateMany.mockResolvedValue({
                modifiedCount: 1,
            });
            const result = yield withdrawalDb.approveWithdrawalRequest(1);
            expect(Withdrawal_1.default.updateMany).toHaveBeenCalledWith({ withdrawalId: 1, status: helpers_1.Status.PENDING }, { $set: { status: helpers_1.Status.APPROVED } });
            expect(result).toBe(helpers_1.HttpStatusResponse.OK);
        }));
        it("should return null if no withdrawal requests were modified", () => __awaiter(void 0, void 0, void 0, function* () {
            Withdrawal_1.default.updateMany.mockResolvedValue({
                modifiedCount: 0,
            });
            const result = yield withdrawalDb.approveWithdrawalRequest(1);
            expect(Withdrawal_1.default.updateMany).toHaveBeenCalledWith({ withdrawalId: 1, status: helpers_1.Status.PENDING }, { $set: { status: helpers_1.Status.APPROVED } });
            expect(result).toBeNull();
        }));
    });
    describe("rejectWithdrawalRequest", () => {
        it("should reject a withdrawal request and return OK status", () => __awaiter(void 0, void 0, void 0, function* () {
            const reason = "Insufficient funds";
            Withdrawal_1.default.updateMany.mockResolvedValue({
                modifiedCount: 1,
            });
            const result = yield withdrawalDb.rejectWithdrawalRequest(1, reason);
            expect(Withdrawal_1.default.updateMany).toHaveBeenCalledWith({ withdrawalId: 1, status: helpers_1.Status.PENDING }, { $set: { status: helpers_1.Status.REJECTED, reason: reason } });
            expect(result).toBe(helpers_1.HttpStatusResponse.OK);
        }));
        it("should return null if no withdrawal requests were modified", () => __awaiter(void 0, void 0, void 0, function* () {
            Withdrawal_1.default.updateMany.mockResolvedValue({
                modifiedCount: 0,
            });
            const result = yield withdrawalDb.rejectWithdrawalRequest(1, "Insufficient funds");
            expect(Withdrawal_1.default.updateMany).toHaveBeenCalledWith({ withdrawalId: 1, status: helpers_1.Status.PENDING }, { $set: { status: helpers_1.Status.REJECTED, reason: "Insufficient funds" } });
            expect(result).toBeNull();
        }));
    });
});
