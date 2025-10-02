"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const EmployeeDb_1 = __importDefault(require("@/database/EmployeeDb"));
const LogDb_1 = __importDefault(require("@/database/LogDb"));
const ReassignmentDb_1 = __importDefault(require("@/database/ReassignmentDb"));
const RequestDb_1 = __importDefault(require("@/database/RequestDb"));
const WithdrawalDb_1 = __importDefault(require("@/database/WithdrawalDb"));
const helpers_1 = require("@/helpers");
const NotificationService_1 = __importDefault(require("@/services/NotificationService"));
const ReassignmentService_1 = __importDefault(require("@/services/ReassignmentService"));
const RequestService_1 = __importDefault(require("@/services/RequestService"));
const WithdrawalService_1 = __importDefault(require("@/services/WithdrawalService"));
const dateUtils = __importStar(require("@/helpers/date"));
const mockData_1 = require("@/tests/mockData");
const globals_1 = require("@jest/globals");
const dayjs_1 = __importDefault(require("dayjs"));
const EmployeeService_1 = __importDefault(require("./EmployeeService"));
const LogService_1 = __importDefault(require("./LogService"));
describe("getWithdrawalRequest", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let logDbMock;
    let logServiceMock;
    let mockMailer;
    let mockTransporter;
    let notificationServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let withdrawalService;
    let withdrawalDbMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        withdrawalDbMock = new WithdrawalDb_1.default();
        withdrawalService = new WithdrawalService_1.default(logServiceMock, withdrawalDbMock, requestService, reassignmentServiceMock, employeeServiceMock, notificationServiceMock);
        withdrawalDbMock.getWithdrawalRequest = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should return array of withdrawal requests for a valid staffId", () => __awaiter(void 0, void 0, void 0, function* () {
        const { staffId } = mockData_1.mockWithdrawalData;
        withdrawalDbMock.getWithdrawalRequest.mockResolvedValue([
            mockData_1.mockWithdrawalData,
        ]);
        const result = yield withdrawalService.getWithdrawalRequest(staffId);
        expect(result).toEqual([mockData_1.mockWithdrawalData]);
    }));
    it("should return null for an invalid staffId", () => __awaiter(void 0, void 0, void 0, function* () {
        withdrawalDbMock.getWithdrawalRequest.mockResolvedValue([]);
        const result = yield withdrawalService.getWithdrawalRequest(1044);
        expect(result).toEqual(null);
    }));
});
describe("withdrawRequest", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let logDbMock;
    let logServiceMock;
    let mockMailer;
    let mockTransporter;
    let notificationServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let withdrawalService;
    let withdrawalDbMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        withdrawalDbMock = new WithdrawalDb_1.default();
        withdrawalService = new WithdrawalService_1.default(logServiceMock, withdrawalDbMock, requestService, reassignmentServiceMock, employeeServiceMock, notificationServiceMock);
        withdrawalDbMock.withdrawRequest = globals_1.jest.fn();
        requestDbMock.getApprovedRequestByRequestId = globals_1.jest.fn();
        withdrawalDbMock.getWithdrawalRequest = globals_1.jest.fn();
        requestDbMock.updateRequestinitiatedWithdrawalValue = globals_1.jest.fn();
        logServiceMock.logRequestHelper = globals_1.jest.fn();
        withdrawalDbMock.getWithdrawalRequest = globals_1.jest.fn();
        employeeServiceMock.getEmployee = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should return null for a valid requestId with existing pending / approved withdrawal", () => __awaiter(void 0, void 0, void 0, function* () {
        const { requestId } = mockData_1.mockWithdrawalData;
        requestDbMock.getApprovedRequestByRequestId.mockResolvedValue([
            mockData_1.mockRequestData.APPROVED,
        ]);
        withdrawalDbMock.getWithdrawalRequest.mockResolvedValue([
            mockData_1.mockWithdrawalData,
        ]);
        withdrawalDbMock.withdrawRequest.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        const result = yield withdrawalService.withdrawRequest(requestId);
        expect(result).toEqual(null);
    }));
    it("should return null for an invalid requestId", () => __awaiter(void 0, void 0, void 0, function* () {
        requestDbMock.getApprovedRequestByRequestId.mockResolvedValue([]);
        const result = yield withdrawalService.getWithdrawalRequest(1044);
        expect(result).toEqual(null);
    }));
    it("should return HttpStatusResponse.OK for a valid requestId with no existing pending / approved withdrawal", () => __awaiter(void 0, void 0, void 0, function* () {
        const { requestId } = mockData_1.mockWithdrawalData;
        requestDbMock.getApprovedRequestByRequestId.mockResolvedValue([
            mockData_1.mockRequestData.APPROVED,
        ]);
        globals_1.jest.spyOn(dateUtils, "checkPastWithdrawalDate").mockReturnValue(false);
        globals_1.jest.spyOn(dateUtils, "checkValidWithdrawalDate").mockReturnValue(true);
        requestDbMock.updateRequestinitiatedWithdrawalValue.mockResolvedValue(true);
        withdrawalDbMock.getWithdrawalRequest.mockResolvedValue([]);
        withdrawalDbMock.withdrawRequest.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        employeeServiceMock.getEmployee.mockResolvedValue(mockData_1.generateMockEmployeeTest);
        const result = yield withdrawalService.withdrawRequest(requestId);
        expect(result).toEqual(helpers_1.HttpStatusResponse.OK);
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
            requestType: helpers_1.Request.WITHDRAWAL,
            requestId: mockData_1.mockWithdrawalData.requestId,
            action: helpers_1.Action.APPLY,
        });
    }));
});
describe("getOwnWithdrawalRequests", () => {
    let withdrawalService;
    let requestService;
    let employeeServiceMock;
    let logServiceMock;
    let reassignmentServiceMock;
    let withdrawalDbMock;
    let notificationServiceMock;
    beforeEach(() => {
        withdrawalDbMock = {
            getOwnWithdrawalRequests: globals_1.jest.fn(),
        };
        logServiceMock = {
            logRequestHelper: globals_1.jest.fn(),
        };
        withdrawalService = new WithdrawalService_1.default(logServiceMock, withdrawalDbMock, requestService, reassignmentServiceMock, employeeServiceMock, notificationServiceMock);
    });
    it("should retrieve withdrawal requests and log the request when there are own requests", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 1;
        const ownRequests = [
            {
                staffName: "John Doe",
                dept: "Finance",
                position: "Accountant",
                reportingManager: 2,
                managerName: "Jane Smith",
            },
        ];
        withdrawalDbMock.getOwnWithdrawalRequests.mockResolvedValueOnce(ownRequests);
        const result = yield withdrawalService.getOwnWithdrawalRequests(staffId);
        expect(result).toEqual(ownRequests);
        expect(withdrawalDbMock.getOwnWithdrawalRequests).toHaveBeenCalledWith(staffId);
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
            performedBy: staffId,
            requestType: "WITHDRAWAL",
            action: helpers_1.Action.RETRIEVE,
            staffName: ownRequests[0].staffName,
            dept: ownRequests[0].dept,
            position: ownRequests[0].position,
            reportingManagerId: ownRequests[0].reportingManager,
            managerName: ownRequests[0].managerName,
        });
    }));
    it("should return an empty array and not log when there are no own requests", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 1;
        withdrawalDbMock.getOwnWithdrawalRequests.mockResolvedValueOnce([]);
        const result = yield withdrawalService.getOwnWithdrawalRequests(staffId);
        expect(result).toEqual([]);
        expect(withdrawalDbMock.getOwnWithdrawalRequests).toHaveBeenCalledWith(staffId);
        expect(logServiceMock.logRequestHelper).not.toHaveBeenCalled();
    }));
});
describe("getWithdrawalRequestById", () => {
    let withdrawalService;
    let requestService;
    let employeeServiceMock;
    let logServiceMock;
    let reassignmentServiceMock;
    let withdrawalDbMock;
    let notificationServiceMock;
    beforeEach(() => {
        withdrawalDbMock = {
            getWithdrawalRequestById: globals_1.jest.fn(),
        };
        withdrawalService = new WithdrawalService_1.default(logServiceMock, withdrawalDbMock, requestService, reassignmentServiceMock, employeeServiceMock, notificationServiceMock);
    });
    it("should return the withdrawal request when found", () => __awaiter(void 0, void 0, void 0, function* () {
        const withdrawalId = 1;
        const mockRequest = {
            id: withdrawalId,
            staffName: "John Doe",
            dept: "Finance",
            position: "Accountant",
        };
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValueOnce(mockRequest);
        const result = yield withdrawalService.getWithdrawalRequestById(withdrawalId);
        expect(result).toEqual(mockRequest);
        expect(withdrawalDbMock.getWithdrawalRequestById).toHaveBeenCalledWith(withdrawalId);
    }));
    it("should return null when the withdrawal request is not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const withdrawalId = 1;
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValueOnce(null);
        const result = yield withdrawalService.getWithdrawalRequestById(withdrawalId);
        expect(result).toBeNull();
        expect(withdrawalDbMock.getWithdrawalRequestById).toHaveBeenCalledWith(withdrawalId);
    }));
});
describe("updateWithdrawalStatusToExpired", () => {
    let withdrawalService;
    let withdrawalDbMock;
    let logServiceMock;
    let requestServiceMock;
    let employeeServiceMock;
    let reassignmentServiceMock;
    let notificationServiceMock;
    beforeEach(() => {
        withdrawalDbMock = {
            updateWithdrawalStatusToExpired: globals_1.jest.fn(),
        };
        logServiceMock = {
            logRequestHelper: globals_1.jest.fn(),
        };
        employeeServiceMock = {
            getEmployee: globals_1.jest.fn(),
        };
        notificationServiceMock = {
            notify: globals_1.jest.fn(),
        };
        withdrawalService = new WithdrawalService_1.default(logServiceMock, withdrawalDbMock, requestServiceMock, reassignmentServiceMock, employeeServiceMock, notificationServiceMock);
    });
    it("should update withdrawal status, notify the employee, and log the action", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequest = [
            {
                requestId: "123",
                requestedDate: "2024-10-26T10:00:00Z",
                requestType: "SomeType",
                staffId: "staff123",
            },
        ];
        const mockEmployee = {
            email: "employee@example.com",
        };
        withdrawalDbMock.updateWithdrawalStatusToExpired.mockResolvedValue(mockRequest);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        yield withdrawalService.updateWithdrawalStatusToExpired();
        expect(withdrawalDbMock.updateWithdrawalStatusToExpired).toHaveBeenCalled();
        expect(employeeServiceMock.getEmployee).toHaveBeenCalledWith(mockRequest[0].staffId);
        expect(notificationServiceMock.notify).toHaveBeenCalledWith(mockEmployee.email, `[WITHDRAWAL] Withdrawal Expired`, `Your request withdrawal has expired. Please contact your reporting manager for more details.`, null, [
            [
                (0, dayjs_1.default)(mockRequest[0].requestedDate).format("YYYY-MM-DD"),
                mockRequest[0].requestType,
            ],
        ]);
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
            performedBy: helpers_1.PerformedBy.SYSTEM,
            requestId: mockRequest[0].requestId,
            requestType: "WITHDRAWAL",
            action: helpers_1.Action.EXPIRE,
            dept: helpers_1.PerformedBy.PERFORMED_BY_SYSTEM,
            position: helpers_1.PerformedBy.PERFORMED_BY_SYSTEM,
        });
    }));
    it("should not proceed with notification and logging if no withdrawal request is found", () => __awaiter(void 0, void 0, void 0, function* () {
        withdrawalDbMock.updateWithdrawalStatusToExpired.mockResolvedValue(null);
        yield withdrawalService.updateWithdrawalStatusToExpired();
        expect(employeeServiceMock.getEmployee).not.toHaveBeenCalled();
        expect(notificationServiceMock.notify).not.toHaveBeenCalled();
        expect(logServiceMock.logRequestHelper).not.toHaveBeenCalled();
    }));
    it("should not log the action if no withdrawal requests are returned", () => __awaiter(void 0, void 0, void 0, function* () {
        withdrawalDbMock.updateWithdrawalStatusToExpired.mockResolvedValueOnce(null);
        yield withdrawalService.updateWithdrawalStatusToExpired();
        expect(withdrawalDbMock.updateWithdrawalStatusToExpired).toHaveBeenCalled();
        expect(logServiceMock.logRequestHelper).not.toHaveBeenCalled();
    }));
});
describe("rejectWithdrawalRequest", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let logDbMock;
    let logServiceMock;
    let mockMailer;
    let mockTransporter;
    let notificationServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let withdrawalService;
    let withdrawalDbMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        withdrawalDbMock = new WithdrawalDb_1.default();
        withdrawalService = new WithdrawalService_1.default(logServiceMock, withdrawalDbMock, requestService, reassignmentServiceMock, employeeServiceMock, notificationServiceMock);
        withdrawalDbMock.getWithdrawalRequestById = globals_1.jest.fn();
        withdrawalDbMock.rejectWithdrawalRequest = globals_1.jest.fn();
        reassignmentServiceMock.getReassignmentActive = globals_1.jest.fn();
        logServiceMock.logRequestHelper = globals_1.jest.fn();
        employeeServiceMock.getEmployee = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should return null if the request is not found or not pending", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 2;
        const withdrawalId = 1;
        const reason = "plans cancelled";
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(null);
        const result = yield withdrawalService.rejectWithdrawalRequest(performedBy, withdrawalId, reason);
        expect(result).toBeNull();
    }));
    it("should return null if the performer is not the reporting manager and there is no active reassignment", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 2;
        const withdrawalId = 1;
        const reason = "plans cancelled";
        const mockRequest = {
            id: withdrawalId,
            status: helpers_1.Status.PENDING,
            requestId: 100,
            reportingManager: 1,
        };
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(mockRequest);
        reassignmentServiceMock.getReassignmentActive.mockResolvedValue(null);
        const result = yield withdrawalService.rejectWithdrawalRequest(performedBy, withdrawalId, reason);
        expect(result).toBeNull();
    }));
    it("should return null if approving the withdrawal request fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 2;
        const withdrawalId = 1;
        const reason = "plans cancelled";
        const mockRequest = {
            id: withdrawalId,
            status: helpers_1.Status.PENDING,
            requestId: 100,
            reportingManager: 1,
        };
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(mockRequest);
        withdrawalDbMock.rejectWithdrawalRequest.mockResolvedValue(null);
        const result = yield withdrawalService.rejectWithdrawalRequest(performedBy, withdrawalId, reason);
        expect(result).toBeNull();
    }));
    it("should return OK if rejecting the withdrawal request is done successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 2;
        const withdrawalId = 1;
        const reason = "plans cancelled";
        const mockRequest = {
            id: withdrawalId,
            status: helpers_1.Status.PENDING,
            requestId: 100,
            reportingManager: 1,
        };
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(mockRequest);
        reassignmentServiceMock.getReassignmentActive.mockResolvedValue(mockData_1.mockReassignmentData);
        withdrawalDbMock.rejectWithdrawalRequest.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        employeeServiceMock.getEmployee.mockResolvedValue(mockData_1.generateMockEmployeeTest);
        const result = yield withdrawalService.rejectWithdrawalRequest(performedBy, withdrawalId, reason);
        expect(result).toEqual(helpers_1.HttpStatusResponse.OK);
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith(expect.objectContaining({
            requestType: helpers_1.Request.WITHDRAWAL,
            reason: reason,
            performedBy: performedBy,
            requestId: mockRequest.id,
            action: helpers_1.Action.REJECT,
        }));
    }));
});
describe("approveWithdrawalRequest", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let logDbMock;
    let logServiceMock;
    let mockMailer;
    let mockTransporter;
    let notificationServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let withdrawalService;
    let withdrawalDbMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        withdrawalDbMock = new WithdrawalDb_1.default();
        withdrawalService = new WithdrawalService_1.default(logServiceMock, withdrawalDbMock, requestService, reassignmentServiceMock, employeeServiceMock, notificationServiceMock);
        withdrawalDbMock.getWithdrawalRequestById = globals_1.jest.fn();
        withdrawalDbMock.approveWithdrawalRequest = globals_1.jest.fn();
        reassignmentServiceMock.getReassignmentActive = globals_1.jest.fn();
        requestService.setWithdrawnStatus = globals_1.jest.fn();
        employeeServiceMock.getEmployee = globals_1.jest.fn();
        logServiceMock.logRequestHelper = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should return null if the request is not found or not pending", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 2;
        const withdrawalId = 1;
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(null);
        const result = yield withdrawalService.approveWithdrawalRequest(performedBy, withdrawalId);
        expect(result).toBeNull();
    }));
    it("should return null if the performer is not the reporting manager and there is no active reassignment", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 2;
        const withdrawalId = 1;
        const mockRequest = {
            id: withdrawalId,
            status: helpers_1.Status.PENDING,
            requestId: 100,
            reportingManager: 1,
        };
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(mockRequest);
        reassignmentServiceMock.getReassignmentActive.mockResolvedValue(null);
        const result = yield withdrawalService.approveWithdrawalRequest(performedBy, withdrawalId);
        expect(result).toBeNull();
    }));
    it("should return null if approving the withdrawal request fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 2;
        const withdrawalId = 1;
        const mockRequest = {
            id: withdrawalId,
            status: helpers_1.Status.PENDING,
            requestId: 100,
            reportingManager: 1,
        };
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(mockRequest);
        withdrawalDbMock.approveWithdrawalRequest.mockResolvedValue(null);
        const result = yield withdrawalService.approveWithdrawalRequest(performedBy, withdrawalId);
        expect(result).toBeNull();
    }));
    it("should return OK if approving the withdrawal request is done successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 2;
        const withdrawalId = 1;
        const mockRequest = {
            id: withdrawalId,
            status: helpers_1.Status.PENDING,
            requestId: 100,
            reportingManager: 1,
        };
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(mockRequest);
        reassignmentServiceMock.getReassignmentActive.mockResolvedValue(mockData_1.mockReassignmentData);
        requestService.setWithdrawnStatus.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        withdrawalDbMock.approveWithdrawalRequest.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        employeeServiceMock.getEmployee.mockResolvedValue(mockData_1.generateMockEmployeeTest);
        const result = yield withdrawalService.approveWithdrawalRequest(performedBy, withdrawalId);
        expect(result).toEqual(helpers_1.HttpStatusResponse.OK);
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith(expect.objectContaining({
            requestType: helpers_1.Request.WITHDRAWAL,
            performedBy: performedBy,
            requestId: mockRequest.id,
            action: helpers_1.Action.APPROVE,
        }));
    }));
    it("should return null if setting the withdrawn status fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 2;
        const withdrawalId = 1;
        const mockRequest = {
            id: withdrawalId,
            status: helpers_1.Status.PENDING,
            requestId: 100,
            reportingManager: 1,
        };
        withdrawalDbMock.getWithdrawalRequestById.mockResolvedValue(mockRequest);
        reassignmentServiceMock.getReassignmentActive.mockResolvedValue(mockData_1.mockReassignmentData);
        requestService.setWithdrawnStatus.mockResolvedValue(null);
        withdrawalDbMock.approveWithdrawalRequest.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        const result = yield withdrawalService.approveWithdrawalRequest(performedBy, withdrawalId);
        expect(result).toBeNull();
    }));
});
describe("getSubordinatesWithdrawalRequests", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let logDbMock;
    let logServiceMock;
    let mockMailer;
    let mockTransporter;
    let notificationServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let withdrawalService;
    let withdrawalDbMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        withdrawalDbMock = new WithdrawalDb_1.default();
        withdrawalService = new WithdrawalService_1.default(logServiceMock, withdrawalDbMock, requestService, reassignmentServiceMock, employeeServiceMock, notificationServiceMock);
        withdrawalDbMock.getWithdrawalRequest = globals_1.jest.fn();
        withdrawalDbMock.getSubordinatesWithdrawalRequests = globals_1.jest.fn();
        reassignmentServiceMock.getActiveReassignmentAsTempManager = globals_1.jest.fn();
        logServiceMock.logRequestHelper = globals_1.jest.fn();
        employeeServiceMock.getEmployee = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should log the request when there are subordinates' withdrawal requests", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockWithdrawalData = [
            {
                requestId: 1,
                staffId: 150245,
                staffName: "Benjamin Tan",
                reportingManager: 151408,
                managerName: "Philip Lee",
                dept: "Engineering",
                position: "Call Centre",
                reason: "Plans cancelled",
                requestedDate: new Date("2024-09-15T00:00:00.000Z"),
                requestType: "AM",
                withdrawalId: 6,
                status: "PENDING",
            },
        ];
        const { reportingManager } = mockWithdrawalData[0];
        withdrawalDbMock.getSubordinatesWithdrawalRequests.mockResolvedValue(mockWithdrawalData);
        reassignmentServiceMock.getActiveReassignmentAsTempManager.mockResolvedValue(null);
        employeeServiceMock.getEmployee.mockResolvedValue({
            staffFName: "Philip",
            staffLName: "Lee",
            dept: "Engineering",
            position: "Manager",
        });
        const result = yield withdrawalService.getSubordinatesWithdrawalRequests(reportingManager, true);
        expect(result).toEqual(mockWithdrawalData);
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith(expect.objectContaining({
            requestType: helpers_1.Request.WITHDRAWAL,
            performedBy: reportingManager,
            action: helpers_1.Action.RETRIEVE,
            staffName: "Philip Lee",
            dept: "Engineering",
            position: "Manager",
        }));
    }));
    it("should return [] if there is no reassignments", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager } = mockData_1.mockWithdrawalData;
        withdrawalDbMock.getSubordinatesWithdrawalRequests.mockResolvedValue([]);
        reassignmentServiceMock.getActiveReassignmentAsTempManager.mockResolvedValue(null);
        const result = yield withdrawalService.getSubordinatesWithdrawalRequests(reportingManager);
        expect(result).toEqual([]);
    }));
    it("should return combined requests if there is active reassignment", () => __awaiter(void 0, void 0, void 0, function* () {
        const reportingManager = 1;
        const mockTempRequests = [{ id: 2, staffId: 3 }];
        const mockReassignmentData = { active: true, staffId: 3 };
        withdrawalDbMock.getSubordinatesWithdrawalRequests.mockResolvedValue([]);
        reassignmentServiceMock.getActiveReassignmentAsTempManager.mockResolvedValue(mockReassignmentData);
        globals_1.jest
            .spyOn(withdrawalService, "getSubordinatesWithdrawalRequests")
            .mockResolvedValue(mockTempRequests);
        const result = yield withdrawalService.getSubordinatesWithdrawalRequests(reportingManager);
        expect(result).toEqual(mockTempRequests);
    }));
});
