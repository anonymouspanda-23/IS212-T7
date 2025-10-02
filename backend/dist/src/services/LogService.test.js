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
const LogService_1 = __importDefault(require("./LogService"));
describe("logRequestHelper", () => {
    let logService;
    let mockEmployeeService;
    let mockLogDb;
    let mockReassignmentDb;
    beforeEach(() => {
        mockEmployeeService = {
            getEmployee: jest.fn(),
        };
        mockLogDb = {
            logAction: jest.fn(),
        };
        logService = new LogService_1.default(mockLogDb, mockEmployeeService, mockReassignmentDb);
    });
    it("should log the action taken with the provided options", () => __awaiter(void 0, void 0, void 0, function* () {
        const options = {
            performedBy: "User1",
            requestType: helpers_1.Request.APPLICATION,
            action: helpers_1.Action.APPROVE,
            dept: helpers_1.Dept.HR,
            position: "Manager",
            requestId: 1,
            reason: "Routine Check",
            staffName: "John Doe",
            reportingManagerId: 150143,
            managerName: "Jane Smith",
        };
        yield logService.logRequestHelper(options);
        expect(mockLogDb.logAction).toHaveBeenCalledWith(options);
    }));
});
describe("getAllLogs", () => {
    let logService;
    let mockEmployeeService;
    let mockLogDb;
    let mockReassignmentDb;
    beforeEach(() => {
        mockEmployeeService = {
            getEmployee: jest.fn(),
        };
        mockLogDb = {
            getLogs: jest.fn(),
            getOwnLogs: jest.fn(),
            getSubordinateLogs: jest.fn(),
        };
        mockReassignmentDb = {
            getActiveReassignmentAsTempManager: jest.fn(),
        };
        logService = new LogService_1.default(mockLogDb, mockEmployeeService, mockReassignmentDb);
    });
    it("should return all logs for role 1", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockData = {
            staffId: 1,
            role: helpers_1.Role.HR,
            dept: helpers_1.Dept.HR,
            position: "Manager",
            allLogs: {
                HR: {
                    Manager: ["log1", "log2"],
                },
                Engineering: {
                    "Senior Engineers": ["log1", "log2"],
                },
            },
        };
        const { staffId, role, dept, position, allLogs } = mockData;
        mockEmployeeService.getEmployee.mockResolvedValue({ role, dept, position });
        mockLogDb.getLogs.mockResolvedValue(allLogs);
        mockLogDb.getOwnLogs.mockResolvedValue(allLogs);
        const result = yield logService.getAllLogs(staffId);
        expect(mockEmployeeService.getEmployee).toHaveBeenCalledWith(staffId);
        expect(mockLogDb.getLogs).toHaveBeenCalled();
        expect(result).toEqual(allLogs);
    }));
    it("should handle active reassignment correctly for Manager role", () => __awaiter(void 0, void 0, void 0, function* () {
        mockEmployeeService.getEmployee.mockResolvedValue({
            role: helpers_1.Role.Manager,
            dept: helpers_1.Dept.ENGINEERING,
            position: "Manager",
        });
        const personalLogs = [{ logId: 1 }];
        const subordinateLogs = [{ logId: 2 }];
        const reassignmentLogs = [{ logId: 3 }];
        mockLogDb.getOwnLogs.mockResolvedValue(personalLogs);
        mockLogDb.getSubordinateLogs.mockResolvedValueOnce(subordinateLogs);
        mockReassignmentDb.getActiveReassignmentAsTempManager.mockResolvedValue({
            staffId: 2,
        });
        mockLogDb.getSubordinateLogs.mockResolvedValueOnce(reassignmentLogs);
        const result = yield logService.getAllLogs(1);
        expect(result).toEqual({
            [helpers_1.Dept.ENGINEERING]: {
                Manager: [...personalLogs, ...subordinateLogs, ...reassignmentLogs],
            },
        });
    }));
    it("should return personal logs for role 2", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 2;
        const mockData = {
            role: helpers_1.Role.Staff,
            dept: helpers_1.Dept.ENGINEERING,
            position: "Senior Engineers",
        };
        const personalLogs = ["log1", "log2"];
        const allLogs = {
            [mockData.dept]: {
                [mockData.position]: personalLogs,
            },
        };
        mockEmployeeService.getEmployee.mockResolvedValue(mockData);
        mockLogDb.getLogs.mockResolvedValue(allLogs);
        mockLogDb.getOwnLogs.mockResolvedValue(personalLogs);
        const result = yield logService.getAllLogs(staffId);
        expect(mockEmployeeService.getEmployee).toHaveBeenCalledWith(staffId);
        expect(mockLogDb.getOwnLogs).toHaveBeenCalledWith(staffId);
        expect(result).toEqual(allLogs);
    }));
    it("should return empty logs if no logs found", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockData = {
            staffId: 2,
            role: helpers_1.Role.Staff,
            dept: helpers_1.Dept.ENGINEERING,
            position: "Senior Engineers",
            allLogs: [],
        };
        const { staffId, role, dept, position, allLogs } = mockData;
        mockEmployeeService.getEmployee.mockResolvedValue({ role, dept, position });
        mockLogDb.getLogs.mockResolvedValue(allLogs);
        mockLogDb.getOwnLogs.mockResolvedValue(allLogs);
        const result = yield logService.getAllLogs(staffId);
        expect(mockEmployeeService.getEmployee).toHaveBeenCalledWith(staffId);
        expect(mockLogDb.getLogs).toHaveBeenCalled();
        expect(result).toEqual({ Engineering: { "Senior Engineers": [] } });
    }));
});
describe("logAction", () => {
    let logService;
    let mockEmployeeService;
    let mockLogDb;
    let mockReassignmentDb;
    beforeEach(() => {
        mockEmployeeService = {
            getEmployee: jest.fn(),
        };
        mockLogDb = {
            logAction: jest.fn(),
        };
        logService = new LogService_1.default(mockLogDb, mockEmployeeService, mockReassignmentDb);
    });
    it("should call logAction with the correct log data", () => __awaiter(void 0, void 0, void 0, function* () {
        const logAction = {
            actionType: "APPLY",
        };
        yield logService.logActions(logAction);
        expect(mockLogDb.logAction).toHaveBeenCalledWith(logAction);
    }));
});
