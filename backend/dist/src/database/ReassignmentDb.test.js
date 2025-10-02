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
const ReassignmentDb_1 = __importDefault(require("./ReassignmentDb"));
jest.mock("@/models/Reassignment", () => ({
    updateMany: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    findOneAndUpdate: jest.fn(),
}));
describe("ReassignmentDb", () => {
    let reassignmentDb;
    beforeEach(() => {
        reassignmentDb = new ReassignmentDb_1.default();
        jest.clearAllMocks();
    });
    describe("insertReassignmentRequest", () => {
        it("should insert a new reassignment request", () => __awaiter(void 0, void 0, void 0, function* () {
            const reassignmentRequest = {
                staffId: 1,
                startDate: new Date(),
                endDate: new Date(),
            };
            yield reassignmentDb.insertReassignmentRequest(reassignmentRequest);
            expect(Reassignment_1.default.create).toHaveBeenCalledWith(reassignmentRequest);
        }));
    });
    describe("getReassignmentRequest", () => {
        it("should return reassignment requests for a specific staffId", () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = 1;
            Reassignment_1.default.find.mockResolvedValue([{ staffId }]);
            const result = yield reassignmentDb.getReassignmentRequest(staffId);
            expect(Reassignment_1.default.find).toHaveBeenCalledWith({ staffId }, "-_id -createdAt -updatedAt");
            expect(result).toEqual([{ staffId }]);
        }));
    });
    describe("getTempMgrReassignmentRequest", () => {
        it("should return reassignment requests for a specific tempReportingManagerId", () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = 1;
            Reassignment_1.default.find.mockResolvedValue([{ tempReportingManagerId: staffId }]);
            const result = yield reassignmentDb.getTempMgrReassignmentRequest(staffId);
            expect(Reassignment_1.default.find).toHaveBeenCalledWith({ tempReportingManagerId: staffId }, "-_id -createdAt -updatedAt");
            expect(result).toEqual([{ tempReportingManagerId: staffId }]);
        }));
    });
    describe("getReassignmentActive", () => {
        it("should return an active reassignment request for a specific staffId and tempReportingManagerId", () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = 1;
            const tempReportingManagerId = 2;
            Reassignment_1.default.findOne.mockResolvedValue({
                staffId,
                tempReportingManagerId,
            });
            const result = yield reassignmentDb.getReassignmentActive(staffId, tempReportingManagerId);
            expect(Reassignment_1.default.findOne).toHaveBeenCalledWith({ staffId, tempReportingManagerId, active: true }, "-_id -createdAt -updatedAt");
            expect(result).toEqual({ staffId, tempReportingManagerId });
        }));
    });
    describe("hasNonRejectedReassignment", () => {
        it("should return true if there is a non-rejected reassignment within the date range", () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = 1;
            const startDate = new Date("2023-01-01");
            const endDate = new Date("2023-01-31");
            Reassignment_1.default.exists.mockResolvedValue(true);
            const result = yield reassignmentDb.hasNonRejectedReassignment(staffId, startDate, endDate);
            expect(Reassignment_1.default.exists).toHaveBeenCalledWith({
                staffId,
                status: { $ne: helpers_1.Status.REJECTED },
                $or: [
                    { startDate: { $lte: endDate, $gte: startDate } },
                    { endDate: { $gte: startDate, $lte: endDate } },
                    { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
                ],
            });
            expect(result).toBe(true);
        }));
    });
    describe("getActiveReassignmentAsTempManager", () => {
        it("should return active reassignment for a temp manager", () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = 1;
            Reassignment_1.default.findOne.mockResolvedValue({
                tempReportingManagerId: staffId,
            });
            const result = yield reassignmentDb.getActiveReassignmentAsTempManager(staffId);
            expect(Reassignment_1.default.findOne).toHaveBeenCalledWith({ tempReportingManagerId: staffId, active: true }, "-_id -createdAt -updatedAt");
            expect(result).toEqual({ tempReportingManagerId: staffId });
        }));
    });
});
