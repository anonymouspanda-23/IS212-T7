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
const UtilsController_1 = __importDefault(require("@/controllers/UtilsController"));
const EmployeeDb_1 = __importDefault(require("@/database/EmployeeDb"));
const LogDb_1 = __importDefault(require("@/database/LogDb"));
const ReassignmentDb_1 = __importDefault(require("@/database/ReassignmentDb"));
const RequestDb_1 = __importDefault(require("@/database/RequestDb"));
const helpers_1 = require("@/helpers");
const counter_1 = require("@/helpers/counter");
const dateUtils = __importStar(require("@/helpers/date"));
const unitTestFunctions_1 = require("@/helpers/unitTestFunctions");
const checkUserRolePermission_1 = require("@/middleware/checkUserRolePermission");
const NotificationService_1 = __importDefault(require("@/services/NotificationService"));
const ReassignmentService_1 = __importDefault(require("@/services/ReassignmentService"));
const RequestService_1 = __importDefault(require("@/services/RequestService"));
const middlewareMockData_1 = require("@/tests/middlewareMockData");
const mockData_1 = require("@/tests/mockData");
const globals_1 = require("@jest/globals");
const dayjs_1 = __importDefault(require("dayjs"));
const EmployeeService_1 = __importDefault(require("./EmployeeService"));
const LogService_1 = __importDefault(require("./LogService"));
beforeAll(() => {
    (0, counter_1.initializeCounter)("requestId");
});
describe("postRequest", () => {
    let logDbMock;
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let mockEmployee;
    let mockMailer;
    let mockTransporter;
    let logServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let notificationServiceMock;
    const mondayWeekBefore = (0, dayjs_1.default)()
        .tz("Asia/Singapore")
        .day(1)
        .subtract(1, "week")
        .format("YYYY-MM-DD");
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        mockEmployee = yield (0, mockData_1.generateMockEmployeeTest)();
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        logServiceMock.logRequestHelper = globals_1.jest.fn();
        requestDbMock.postRequest = globals_1.jest.fn();
        requestDbMock.getPendingOrApprovedRequests = globals_1.jest.fn();
        employeeServiceMock.getEmployee = globals_1.jest.fn();
        notificationServiceMock.pushRequestSentNotification = globals_1.jest.fn();
        globals_1.jest.mock("@/helpers/date");
    }));
    afterEach(() => {
        globals_1.jest.resetAllMocks();
    });
    it("should return weekendDates array for weekend inputted", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestDetails = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "Development",
            requestedDates: [[(0, unitTestFunctions_1.dayWeekAfter)(6), "FULL"]],
            reason: "Take care of mother",
        };
        const expectedResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [],
            weekendDates: [[(0, unitTestFunctions_1.dayWeekAfter)(6), "FULL"]],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [],
        };
        mockData_1.mockRequestData.PENDING.requestedDate = String(new Date((0, unitTestFunctions_1.dayWeekAfter)(2)));
        requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
            mockData_1.mockRequestData.PENDING,
        ]);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield requestService.postRequest(requestDetails);
        expect(result).toEqual(expectedResponse);
        expect(notificationServiceMock.pushRequestSentNotification).toHaveBeenCalledTimes(0);
    }));
    it("should return pastDates array for past date inputted", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestDetails = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "Development",
            requestedDates: [[mondayWeekBefore, "FULL"]],
            reason: "Take care of mother",
        };
        const expectedResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [[mondayWeekBefore, "FULL"]],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [],
        };
        mockData_1.mockRequestData.PENDING.requestedDate = String(new Date((0, unitTestFunctions_1.dayWeekAfter)(2)));
        requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
            mockData_1.mockRequestData.PENDING,
        ]);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield requestService.postRequest(requestDetails);
        expect(result).toEqual(expectedResponse);
        expect(notificationServiceMock.pushRequestSentNotification).toHaveBeenCalledTimes(0);
    }));
    it("should return successDates for successful date inputted", () => __awaiter(void 0, void 0, void 0, function* () {
        const emailSubject = helpers_1.EmailHeaders.REQUEST_SENT;
        const requestDetails = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "Development",
            requestedDates: [[(0, unitTestFunctions_1.dayWeekAfter)(3), "FULL"]],
            reason: "Take care of mother",
        };
        const expectedResponse = {
            successDates: [[(0, unitTestFunctions_1.dayWeekAfter)(3), "FULL"]],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [],
        };
        mockData_1.mockRequestData.testing.requestedDate = new Date((0, unitTestFunctions_1.dayWeekAfter)(2));
        requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
            mockData_1.mockRequestData.testing,
        ]);
        requestDbMock.postRequest.mockResolvedValue(true);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const { email, reportingManager } = mockEmployee;
        const result = yield requestService.postRequest(requestDetails);
        expect(result).toEqual(expectedResponse);
        expect(notificationServiceMock.pushRequestSentNotification).toHaveBeenCalledTimes(1);
        expect(notificationServiceMock.pushRequestSentNotification).toHaveBeenCalledWith(emailSubject, email, reportingManager, "APPLICATION", expectedResponse.successDates, requestDetails.reason);
    }));
    it("should return duplicateDates array and successDates for duplicate date inputted (successful date)", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestDetails = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "Development",
            requestedDates: [
                [(0, unitTestFunctions_1.dayWeekAfter)(3), "FULL"],
                [(0, unitTestFunctions_1.dayWeekAfter)(3), "AM"],
            ],
            reason: "Take care of mother",
        };
        const expectedResponse = {
            successDates: [[(0, unitTestFunctions_1.dayWeekAfter)(3), "FULL"]],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [[(0, unitTestFunctions_1.dayWeekAfter)(3), "AM"]],
            insertErrorDates: [],
        };
        mockData_1.mockRequestData.testing.requestedDate = new Date((0, unitTestFunctions_1.dayWeekAfter)(2));
        requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
            mockData_1.mockRequestData.testing,
        ]);
        requestDbMock.postRequest.mockResolvedValue(true);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield requestService.postRequest(requestDetails);
        expect(result).toEqual(expectedResponse);
        expect(notificationServiceMock.pushRequestSentNotification).toHaveBeenCalledTimes(1);
    }));
    it("should return noteDates array and successDates for successful dates inputted with >2 existing requests for that week", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestDetails = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "Development",
            requestedDates: [
                [(0, unitTestFunctions_1.dayWeekAfter)(4), "FULL"],
                [(0, unitTestFunctions_1.dayWeekAfter)(3), "FULL"],
            ],
            reason: "Take care of mother",
        };
        const expectedResponse = {
            successDates: [
                [(0, unitTestFunctions_1.dayWeekAfter)(4), "FULL"],
                [(0, unitTestFunctions_1.dayWeekAfter)(3), "FULL"],
            ],
            noteDates: [[(0, unitTestFunctions_1.dayWeekAfter)(3), "FULL"]],
            errorDates: [],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [],
        };
        mockData_1.mockRequestData.testing.requestedDate = new Date((0, unitTestFunctions_1.dayWeekAfter)(2));
        requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
            mockData_1.mockRequestData.testing,
        ]);
        requestDbMock.postRequest.mockResolvedValue(true);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield requestService.postRequest(requestDetails);
        expect(result).toEqual(expectedResponse);
        expect(notificationServiceMock.pushRequestSentNotification).toHaveBeenCalledTimes(1);
    }));
    it("should return insertError array when successful dates inputted but with DB Error", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestDetails = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "Development",
            requestedDates: [[(0, unitTestFunctions_1.dayWeekAfter)(3), "FULL"]],
            reason: "Take care of mother",
        };
        const expectedResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [[(0, unitTestFunctions_1.dayWeekAfter)(3), "FULL"]],
        };
        mockData_1.mockRequestData.testing.requestedDate = new Date((0, unitTestFunctions_1.dayWeekAfter)(2));
        requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
            mockData_1.mockRequestData.testing,
        ]);
        requestDbMock.postRequest.mockResolvedValue(false);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield requestService.postRequest(requestDetails);
        expect(result).toEqual(expectedResponse);
        expect(notificationServiceMock.pushRequestSentNotification).toHaveBeenCalledTimes(0);
    }));
    it("should return pastDeadlineDates array when dates inputted has past deadline", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestDetails = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "Development",
            requestedDates: [[(0, unitTestFunctions_1.dayWeekAfter)(1), "FULL"]],
            reason: "Take care of mother",
        };
        const expectedResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [[(0, unitTestFunctions_1.dayWeekAfter)(1), "FULL"]],
            duplicateDates: [],
            insertErrorDates: [],
        };
        mockData_1.mockRequestData.testing.requestedDate = new Date((0, unitTestFunctions_1.dayWeekAfter)(2));
        requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
            mockData_1.mockRequestData.testing,
        ]);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        globals_1.jest.spyOn(dateUtils, "checkLatestDate").mockReturnValue(true);
        const result = yield requestService.postRequest(requestDetails);
        expect(result).toEqual(expectedResponse);
        expect(notificationServiceMock.pushRequestSentNotification).toHaveBeenCalledTimes(0);
    }));
    it("should return errorDates array when there is already a pending / approved request for that date", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestDetails = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "Development",
            requestedDates: [[(0, unitTestFunctions_1.dayWeekAfter)(4), "FULL"]],
            reason: "Take care of mother",
        };
        const expectedResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [[(0, unitTestFunctions_1.dayWeekAfter)(4), "FULL"]],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [],
        };
        mockData_1.mockRequestData.testing.requestedDate = new Date((0, unitTestFunctions_1.dayWeekAfter)(4));
        requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
            mockData_1.mockRequestData.testing,
        ]);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield requestService.postRequest(requestDetails);
        expect(result).toEqual(expectedResponse);
        expect(notificationServiceMock.pushRequestSentNotification).toHaveBeenCalledTimes(0);
    }));
});
describe("getPendingOrApprovedRequests", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let mockMailer;
    let mockTransporter;
    let logDbMock;
    let logServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let notificationServiceMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        requestDbMock.getPendingOrApprovedRequests = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should return array of requests for a valid staffId", () => __awaiter(void 0, void 0, void 0, function* () {
        const { staffId } = mockData_1.mockRequestData.PENDING;
        requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([
            mockData_1.mockRequestData.PENDING,
        ]);
        const result = yield requestService.getPendingOrApprovedRequests(staffId);
        expect(result).toEqual([mockData_1.mockRequestData.PENDING]);
    }));
    it("should return [] for an invalid staffId", () => __awaiter(void 0, void 0, void 0, function* () {
        requestDbMock.getPendingOrApprovedRequests.mockResolvedValue([]);
        const result = yield requestService.getPendingOrApprovedRequests(1044);
        expect(result).toEqual([]);
    }));
});
describe("cancel pending requests", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let mockMailer;
    let mockTransporter;
    let logDbMock;
    let logServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let notificationServiceMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        /**
         * Mock Database Calls
         */
        requestDbMock.cancelPendingRequests = globals_1.jest.fn();
        employeeDbMock.getEmployee = globals_1.jest.fn();
        employeeServiceMock.getEmployee = globals_1.jest.fn();
        UtilsController_1.default.throwAPIError = globals_1.jest.fn();
        notificationServiceMock.notify = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should return status not modified if there is no pending request", () => __awaiter(void 0, void 0, void 0, function* () {
        const { staffId, requestId } = mockData_1.mockRequestData.APPROVED;
        requestDbMock.cancelPendingRequests.mockResolvedValue(null);
        const result = yield requestService.cancelPendingRequests(staffId, requestId);
        expect(result).toEqual(null);
    }));
    it("should cancel user's pending request", () => __awaiter(void 0, void 0, void 0, function* () {
        const { staffId, requestId } = mockData_1.mockRequestData.PENDING;
        const mockCancelledRequest = [
            {
                requestedDate: "2024-10-26",
                requestType: "AM",
            },
        ];
        requestDbMock.cancelPendingRequests.mockResolvedValue(mockCancelledRequest);
        employeeServiceMock.getEmployee.mockResolvedValue({
            staffFName: "Janice",
            staffLName: "Chan",
            reportingManager: 140894,
            reportingManagerName: "Rahim Khalid",
            email: "janice.chan@example.com",
            dept: "Finance",
            position: "Analyst",
        });
        const result = yield requestService.cancelPendingRequests(staffId, requestId);
        expect(result).toEqual(helpers_1.HttpStatusResponse.OK);
    }));
});
describe("get pending requests", () => {
    let employeeDbMock;
    let employeeServiceMock;
    let requestService;
    let requestDbMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let ctx;
    let mockMailer;
    let mockTransporter;
    let next;
    const checkUserRolePermMiddleware = (0, checkUserRolePermission_1.checkUserRolePermission)(helpers_1.AccessControl.VIEW_PENDING_REQUEST);
    let logDbMock;
    let logServiceMock;
    let notificationServiceMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        /**
         * Mock Database Calls
         */
        requestDbMock.getAllSubordinatesRequests = globals_1.jest.fn();
        next = globals_1.jest.fn();
        EmployeeService_1.default.prototype.getEmployee = globals_1.jest.fn();
        UtilsController_1.default.throwAPIError = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should not return pending requests because of missing headers", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx = {
            request: {
                header: {},
            },
        };
        ctx.request.header.id = undefined;
        yield checkUserRolePermMiddleware(ctx, next);
        expect(UtilsController_1.default.throwAPIError).toHaveBeenCalledWith(ctx, helpers_1.errMsg.MISSING_HEADER);
        expect(next).not.toHaveBeenCalled();
    }));
    it("should not return pending requests because user is unauthorised", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx = {
            request: {
                header: {},
            },
        };
        ctx.request.header.id = String(middlewareMockData_1.middlewareMockData.Engineering.staffId);
        employeeServiceMock.getEmployee.mockResolvedValue(middlewareMockData_1.middlewareMockData.Engineering);
        yield checkUserRolePermMiddleware(ctx, next);
        expect(UtilsController_1.default.throwAPIError).toHaveBeenCalledWith(ctx, helpers_1.errMsg.UNAUTHORISED);
        expect(next).not.toHaveBeenCalled();
    }));
    it("should return user's direct subordinates pending requests", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager } = mockData_1.mockRequestData.PENDING;
        requestDbMock.getAllSubordinatesRequests.mockResolvedValue(mockData_1.mockRequestData.PENDING);
        const result = yield requestService.getAllSubordinatesRequests(reportingManager);
        expect(result).toEqual(mockData_1.mockRequestData.PENDING);
    }));
    it("should still return user's direct subordinates requests that have been approved", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager } = mockData_1.mockRequestData.APPROVED;
        requestDbMock.getAllSubordinatesRequests.mockResolvedValue(mockData_1.mockRequestData.APPROVED);
        const result = yield requestService.getAllSubordinatesRequests(reportingManager);
        expect(result).toEqual(mockData_1.mockRequestData.APPROVED);
    }));
});
describe("get my schedule", () => {
    let requestService;
    let logServiceMock;
    let employeeServiceMock;
    let requestDbMock;
    let reassignmentServiceMock;
    let mockTransporter;
    let mockMailer;
    let notificationServiceMock;
    beforeEach(() => {
        employeeServiceMock = {
            getEmployee: globals_1.jest.fn(),
        };
        requestDbMock = {
            getMySchedule: globals_1.jest.fn(),
        };
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
    });
    it("should return USER_DOES_NOT_EXIST when employee does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const myId = 1;
        employeeServiceMock.getEmployee.mockResolvedValue(null);
        const result = yield requestService.getMySchedule(myId);
        expect(result).toBe(helpers_1.errMsg.USER_DOES_NOT_EXIST);
    }));
    it("should return REQUESTS_NOT_FOUND when no schedule is found", () => __awaiter(void 0, void 0, void 0, function* () {
        const myId = 1;
        employeeServiceMock.getEmployee.mockResolvedValue({ id: myId });
        requestDbMock.getMySchedule.mockResolvedValue([]);
        const result = yield requestService.getMySchedule(myId);
        expect(result).toBe(helpers_1.errMsg.REQUESTS_NOT_FOUND);
    }));
    it("should return the schedule when found", () => __awaiter(void 0, void 0, void 0, function* () {
        const myId = 1;
        const mockSchedule = [{ id: 1, date: "2024-10-21", task: "Meeting" }];
        employeeServiceMock.getEmployee.mockResolvedValue({ id: myId });
        requestDbMock.getMySchedule.mockResolvedValue(mockSchedule);
        const result = yield requestService.getMySchedule(myId);
        expect(result).toEqual(mockSchedule);
    }));
});
describe("update request initiatedWithdrawal vlue", () => {
    let requestService;
    let logServiceMock;
    let employeeServiceMock;
    let requestDbMock;
    let reassignmentServiceMock;
    let mockTransporter;
    let mockMailer;
    let notificationServiceMock;
    beforeEach(() => {
        employeeServiceMock = {
            getEmployee: globals_1.jest.fn(),
        };
        requestDbMock = {
            updateRequestinitiatedWithdrawalValue: globals_1.jest.fn(),
        };
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
    });
    it("should update the withdrawal value and return the result", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestId = 1;
        const mockUpdateResult = { success: true };
        requestDbMock.updateRequestinitiatedWithdrawalValue.mockResolvedValue(mockUpdateResult);
        const result = yield requestService.updateRequestinitiatedWithdrawalValue(requestId);
        expect(result).toEqual(mockUpdateResult);
        expect(requestDbMock.updateRequestinitiatedWithdrawalValue).toHaveBeenCalledWith(requestId);
    }));
    it("should handle error scenarios when update fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestId = 2;
        const mockError = new Error("Update failed");
        requestDbMock.updateRequestinitiatedWithdrawalValue.mockRejectedValue(mockError);
        yield expect(requestService.updateRequestinitiatedWithdrawalValue(requestId)).rejects.toThrow("Update failed");
        expect(requestDbMock.updateRequestinitiatedWithdrawalValue).toHaveBeenCalledWith(requestId);
    }));
});
describe("get schedule", () => {
    let requestService;
    let logServiceMock;
    let employeeServiceMock;
    let requestDbMock;
    let reassignmentServiceMock;
    let mockTransporter;
    let mockMailer;
    let notificationServiceMock;
    beforeEach(() => {
        logServiceMock = {
            logRequestHelper: globals_1.jest.fn(),
        };
        employeeServiceMock = {
            getEmployee: globals_1.jest.fn(),
            getAllDeptTeamCount: globals_1.jest.fn(),
        };
        requestDbMock = {
            getAllDeptSchedule: globals_1.jest.fn(),
            getTeamSchedule: globals_1.jest.fn(),
        };
        reassignmentServiceMock = {
            getActiveReassignmentAsTempManager: globals_1.jest.fn(),
        };
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
    });
    it("should return USER_DOES_NOT_EXIST when employee does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 1;
        employeeServiceMock.getEmployee.mockResolvedValue(null);
        const result = yield requestService.getSchedule(staffId);
        expect(result).toBe(helpers_1.errMsg.USER_DOES_NOT_EXIST);
    }));
    it("should return schedule for manager or HR", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 2;
        const employee = {
            role: helpers_1.Role.Manager,
            position: "Manager",
            dept: "Sales",
            staffFName: "John",
            staffLName: "Doe",
            reportingManagerName: "Jane Smith",
        };
        const allDeptTeamCount = {
            Sales: {
                teams: {
                    Manager: [],
                },
            },
        };
        const wfhStaff = {
            Sales: [],
        };
        const activeReassignment = {
            active: true,
            originalManagerDept: "Sales",
        };
        employeeServiceMock.getEmployee.mockResolvedValue(employee);
        employeeServiceMock.getAllDeptTeamCount.mockResolvedValue(allDeptTeamCount);
        requestDbMock.getAllDeptSchedule.mockResolvedValue(wfhStaff);
        reassignmentServiceMock.getActiveReassignmentAsTempManager.mockResolvedValue(activeReassignment);
        const result = yield requestService.getSchedule(staffId);
        expect(result).toEqual({
            Sales: {
                teams: {
                    Manager: [],
                },
                wfhStaff: [],
                isTempTeam: true,
            },
        });
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
            performedBy: staffId,
            requestType: "APPLICATION",
            action: helpers_1.Action.RETRIEVE,
            staffName: "John Doe",
            dept: "Sales",
            position: "Manager",
        });
    }));
    it("should assign WFH staff correctly when department has WFH staff", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 3;
        const employee = {
            role: helpers_1.Role.Manager,
            position: "Manager",
            dept: "Marketing",
            staffFName: "Alice",
            staffLName: "Johnson",
            reportingManagerName: "Bob Brown",
        };
        const allDeptTeamCount = {
            Marketing: {
                teams: {
                    Manager: [],
                },
            },
        };
        const wfhStaff = {
            Marketing: [
                { name: "Charlie Black", position: "Developer" },
                { name: "Diana White", position: "Designer" },
            ],
        };
        const activeReassignment = {
            active: false,
            originalManagerDept: "Marketing",
        };
        employeeServiceMock.getEmployee.mockResolvedValue(employee);
        employeeServiceMock.getAllDeptTeamCount.mockResolvedValue(allDeptTeamCount);
        requestDbMock.getAllDeptSchedule.mockResolvedValue(wfhStaff);
        reassignmentServiceMock.getActiveReassignmentAsTempManager.mockResolvedValue(activeReassignment);
        const result = yield requestService.getSchedule(staffId);
        expect(result).toEqual({
            Marketing: {
                teams: {
                    Manager: [],
                },
                wfhStaff: [
                    { name: "Charlie Black", position: "Developer" },
                    { name: "Diana White", position: "Designer" },
                ],
            },
        });
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
            performedBy: staffId,
            requestType: "APPLICATION",
            action: helpers_1.Action.RETRIEVE,
            staffName: "Alice Johnson",
            dept: "Marketing",
            position: "Manager",
        });
    }));
    it("should return schedule for regular staff", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 3;
        const employee = {
            role: helpers_1.Role.Staff,
            position: "Sales Rep",
            reportingManager: 4,
            dept: "Sales",
            staffFName: "Alice",
            staffLName: "Johnson",
            reportingManagerName: "Bob Brown",
        };
        const allDeptTeamCount = {
            Sales: {
                teams: {
                    "Sales Rep": [],
                },
            },
        };
        const wfhStaff = [];
        employeeServiceMock.getEmployee.mockResolvedValue(employee);
        employeeServiceMock.getAllDeptTeamCount.mockResolvedValue(allDeptTeamCount);
        requestDbMock.getTeamSchedule.mockResolvedValue(wfhStaff);
        const result = yield requestService.getSchedule(staffId);
        expect(result).toEqual({
            Sales: {
                teams: {
                    "Sales Rep": [],
                },
                wfhStaff: [],
            },
        });
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
            performedBy: staffId,
            requestType: "APPLICATION",
            action: helpers_1.Action.RETRIEVE,
            staffName: "Alice Johnson",
            reportingManagerId: 4,
            managerName: "Bob Brown",
            dept: "Sales",
            position: "Sales Rep",
        });
    }));
});
describe("get approved request by requestId", () => {
    let requestService;
    let logServiceMock;
    let employeeServiceMock;
    let requestDbMock;
    let reassignmentServiceMock;
    let mockTransporter;
    let mockMailer;
    let notificationServiceMock;
    beforeEach(() => {
        logServiceMock = {
            logRequestHelper: globals_1.jest.fn(),
        };
        employeeServiceMock = {
            getEmployee: globals_1.jest.fn(),
        };
        requestDbMock = {
            getApprovedRequestByRequestId: globals_1.jest.fn(),
        };
        reassignmentServiceMock = {
            getActiveReassignmentAsTempManager: globals_1.jest.fn(),
        };
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
    });
    it("should return request details when a valid request ID is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestId = 1;
        const mockRequestDetail = { id: requestId, status: "Approved" };
        requestDbMock.getApprovedRequestByRequestId.mockResolvedValue(mockRequestDetail);
        const result = yield requestService.getApprovedRequestByRequestId(requestId);
        expect(result).toEqual(mockRequestDetail);
        expect(requestDbMock.getApprovedRequestByRequestId).toHaveBeenCalledWith(requestId);
    }));
    it("should return null or undefined if no request is found for the given request ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestId = 2;
        requestDbMock.getApprovedRequestByRequestId.mockResolvedValue(null);
        const result = yield requestService.getApprovedRequestByRequestId(requestId);
        expect(result).toBeNull();
        expect(requestDbMock.getApprovedRequestByRequestId).toHaveBeenCalledWith(requestId);
    }));
    it("should handle errors when the request database call fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestId = 3;
        const mockError = new Error("Database error");
        requestDbMock.getApprovedRequestByRequestId.mockRejectedValue(mockError);
        yield expect(requestService.getApprovedRequestByRequestId(requestId)).rejects.toThrow("Database error");
        expect(requestDbMock.getApprovedRequestByRequestId).toHaveBeenCalledWith(requestId);
    }));
});
describe("get own pending requests", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let mockMailer;
    let mockTransporter;
    let logDbMock;
    let logServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let notificationServiceMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        /**
         * Mock Database Calls
         */
        requestDbMock.getOwnPendingRequests = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should return user's pending requests", () => __awaiter(void 0, void 0, void 0, function* () {
        const { staffId } = mockData_1.mockRequestData.PENDING;
        requestDbMock.getOwnPendingRequests.mockResolvedValue(mockData_1.mockRequestData.PENDING);
        const result = yield requestService.getOwnPendingRequests(staffId);
        expect(result).toEqual(mockData_1.mockRequestData.PENDING);
    }));
    it("should not return user's requests that have been approved", () => __awaiter(void 0, void 0, void 0, function* () {
        const { staffId } = mockData_1.mockRequestData.APPROVED;
        requestDbMock.getOwnPendingRequests.mockResolvedValue([]);
        const result = yield requestService.getOwnPendingRequests(staffId);
        expect(result).toEqual([]);
    }));
});
describe("reject pending requests", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let mockEmployee;
    let mockMailer;
    let mockTransporter;
    let logDbMock;
    let logServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let notificationServiceMock;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        mockEmployee = yield (0, mockData_1.generateMockEmployeeTest)();
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        requestDbMock.getPendingRequestByRequestId = globals_1.jest.fn();
        requestDbMock.rejectRequest = globals_1.jest.fn();
        EmployeeService_1.default.prototype.getEmployee = globals_1.jest.fn();
        ReassignmentService_1.default.prototype.getReassignmentActive = globals_1.jest.fn();
        UtilsController_1.default.throwAPIError = globals_1.jest.fn();
    }));
    afterEach(() => {
        globals_1.jest.resetAllMocks();
    });
    it("should return status not modified if there is no pending request", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager, requestId, reason } = mockData_1.mockRequestData.APPROVED;
        requestDbMock.getPendingRequestByRequestId.mockResolvedValue(null);
        const result = yield requestService.rejectRequest(reportingManager, requestId, reason);
        expect(result).toEqual(null);
        expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(requestId);
    }));
    it("should reject user's pending request", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager, requestId, reason } = mockData_1.mockRequestData.PENDING;
        requestDbMock.rejectRequest.mockResolvedValue(mockData_1.mockRequestData.REJECTED);
        requestDbMock.getPendingRequestByRequestId.mockResolvedValue(mockData_1.mockRequestData.PENDING);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield requestService.rejectRequest(reportingManager, requestId, reason);
        expect(result).toEqual(helpers_1.HttpStatusResponse.OK);
        expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(requestId);
        expect(EmployeeService_1.default.prototype.getEmployee).toHaveBeenCalledWith(mockData_1.mockRequestData.PENDING.staffId);
    }));
    it("should return status not modified if employee not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager, requestId, reason } = mockData_1.mockRequestData.PENDING;
        requestDbMock.getPendingRequestByRequestId.mockResolvedValue(mockData_1.mockRequestData.PENDING);
        employeeServiceMock.getEmployee.mockResolvedValue(null);
        const result = yield requestService.rejectRequest(reportingManager, requestId, reason);
        expect(result).toEqual(null);
        expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(requestId);
    }));
    it("should return null if performedBy is not authorized", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager, requestId, reason } = mockData_1.mockRequestData.PENDING;
        requestDbMock.getPendingRequestByRequestId.mockResolvedValue(mockData_1.mockRequestData.PENDING);
        mockEmployee.reportingManager = null;
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield requestService.rejectRequest(reportingManager, requestId, reason);
        expect(result).toEqual(null);
        expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(requestId);
    }));
});
describe("approve pending requests", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let mockEmployee;
    let mockMailer;
    let mockTransporter;
    let logDbMock;
    let logServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let notificationServiceMock;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        mockEmployee = yield (0, mockData_1.generateMockEmployeeTest)();
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        requestDbMock.getPendingRequestByRequestId = globals_1.jest.fn();
        requestDbMock.approveRequest = globals_1.jest.fn();
        EmployeeService_1.default.prototype.getEmployee = globals_1.jest.fn();
        UtilsController_1.default.throwAPIError = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    }));
    it("should return status not modified if there is no pending request", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager, requestId } = mockData_1.mockRequestData.APPROVED;
        requestDbMock.getPendingRequestByRequestId.mockResolvedValue(null);
        const result = yield requestService.approveRequest(reportingManager, requestId);
        expect(result).toEqual(null);
        expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(requestId);
    }));
    it("should approve user's pending request", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager, requestId } = mockData_1.mockRequestData.PENDING;
        requestDbMock.approveRequest.mockResolvedValue(mockData_1.mockRequestData.APPROVED);
        requestDbMock.getPendingRequestByRequestId.mockResolvedValue(mockData_1.mockRequestData.PENDING);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield requestService.approveRequest(reportingManager, requestId);
        expect(result).toEqual(helpers_1.HttpStatusResponse.OK);
        expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(requestId);
        expect(EmployeeService_1.default.prototype.getEmployee).toHaveBeenCalledWith(mockData_1.mockRequestData.PENDING.staffId);
    }));
    it("should return status not modified if employee not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager, requestId } = mockData_1.mockRequestData.PENDING;
        requestDbMock.getPendingRequestByRequestId.mockResolvedValue(mockData_1.mockRequestData.PENDING);
        employeeServiceMock.getEmployee.mockResolvedValue(null);
        const result = yield requestService.approveRequest(reportingManager, requestId);
        expect(result).toEqual(null);
        expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(requestId);
    }));
    it("should return null if performedBy is not authorized", () => __awaiter(void 0, void 0, void 0, function* () {
        const { reportingManager, requestId } = mockData_1.mockRequestData.PENDING;
        requestDbMock.getPendingRequestByRequestId.mockResolvedValue(mockData_1.mockRequestData.PENDING);
        mockEmployee.reportingManager = null;
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield requestService.approveRequest(reportingManager, requestId);
        expect(result).toEqual(null);
        expect(requestDbMock.getPendingRequestByRequestId).toHaveBeenCalledWith(requestId);
    }));
});
describe("getPendingRequestByRequestId", () => {
    let requestService;
    let requestDbMock;
    let employeeDbMock;
    let employeeServiceMock;
    let mockMailer;
    let mockTransporter;
    let logDbMock;
    let logServiceMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let notificationServiceMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        requestDbMock.getPendingRequestByRequestId = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should return request for a valid requestId", () => __awaiter(void 0, void 0, void 0, function* () {
        const { requestId } = mockData_1.mockRequestData.PENDING;
        requestDbMock.getPendingRequestByRequestId.mockResolvedValue([
            mockData_1.mockRequestData.PENDING,
        ]);
        const result = yield requestService.getPendingRequestByRequestId(requestId);
        expect(result).toEqual([mockData_1.mockRequestData.PENDING]);
    }));
    it("should return [] for an invalid staffId", () => __awaiter(void 0, void 0, void 0, function* () {
        requestDbMock.getPendingRequestByRequestId.mockResolvedValue(null);
        const result = yield requestService.getPendingRequestByRequestId(1044);
        expect(result).toEqual(null);
    }));
});
describe("setWithdrawnStatus", () => {
    let requestService;
    let logServiceMock;
    let employeeServiceMock;
    let requestDbMock;
    let reassignmentServiceMock;
    let mockTransporter;
    let mockMailer;
    let notificationServiceMock;
    beforeEach(() => {
        logServiceMock = {
            logRequestHelper: globals_1.jest.fn(),
        };
        employeeServiceMock = {
            getEmployee: globals_1.jest.fn(),
        };
        requestDbMock = {
            setWithdrawnStatus: globals_1.jest.fn(),
        };
        reassignmentServiceMock = {
            getReassignmentActive: globals_1.jest.fn(),
        };
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
    });
    it("should return null if the status update fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestId = 1;
        requestDbMock.setWithdrawnStatus.mockResolvedValue(null);
        const result = yield requestService.setWithdrawnStatus(requestId);
        expect(result).toBeNull();
    }));
    it("should return OK on successful status update", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestId = 2;
        requestDbMock.setWithdrawnStatus.mockResolvedValue(true);
        const result = yield requestService.setWithdrawnStatus(requestId);
        expect(result).toBe(helpers_1.HttpStatusResponse.OK);
    }));
    it("should call setWithdrawnStatus with the correct requestId", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestId = 3;
        requestDbMock.setWithdrawnStatus.mockResolvedValue(true);
        yield requestService.setWithdrawnStatus(requestId);
        expect(requestDbMock.setWithdrawnStatus).toHaveBeenCalledWith(requestId);
    }));
});
describe("updateRequestStatusToExpired", () => {
    let requestService;
    let logServiceMock;
    let employeeServiceMock;
    let requestDbMock;
    let reassignmentServiceMock;
    let notificationServiceMock;
    beforeEach(() => {
        requestDbMock = {
            updateRequestStatusToExpired: globals_1.jest.fn(),
        };
        employeeServiceMock = {
            getEmployee: globals_1.jest.fn(),
        };
        notificationServiceMock = {
            notify: globals_1.jest.fn(),
        };
        logServiceMock = {
            logRequestHelper: globals_1.jest.fn(),
        };
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
    });
    it("should update request status to expired, notify employee, and log the action", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequests = [
            {
                requestId: "req123",
                staffId: "staff123",
                requestedDate: "2023-10-10",
                requestType: "REASSIGNMENT",
            },
        ];
        const mockEmployee = { email: "test@example.com" };
        requestDbMock.updateRequestStatusToExpired.mockResolvedValue(mockRequests);
        employeeServiceMock.getEmployee.mockResolvedValue(mockEmployee);
        yield requestService.updateRequestStatusToExpired();
        expect(requestDbMock.updateRequestStatusToExpired).toHaveBeenCalled();
        expect(employeeServiceMock.getEmployee).toHaveBeenCalledWith("staff123");
        const formattedDate = (0, dayjs_1.default)("2023-10-10").format("YYYY-MM-DD");
        expect(notificationServiceMock.notify).toHaveBeenCalledWith("test@example.com", `[APPLICATION] Application Expired`, "Your application has expired. Please re-apply.", null, [[formattedDate, "REASSIGNMENT"]]);
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
            performedBy: helpers_1.PerformedBy.SYSTEM,
            requestId: "req123",
            requestType: "REASSIGNMENT",
            action: helpers_1.Action.EXPIRE,
            dept: helpers_1.PerformedBy.PERFORMED_BY_SYSTEM,
            position: helpers_1.PerformedBy.PERFORMED_BY_SYSTEM,
        });
    }));
    it("should not proceed if no expired requests are returned", () => __awaiter(void 0, void 0, void 0, function* () {
        requestDbMock.updateRequestStatusToExpired.mockResolvedValue([]);
        yield requestService.updateRequestStatusToExpired();
        expect(requestDbMock.updateRequestStatusToExpired).toHaveBeenCalled();
        expect(employeeServiceMock.getEmployee).not.toHaveBeenCalled();
        expect(notificationServiceMock.notify).not.toHaveBeenCalled();
        expect(logServiceMock.logRequestHelper).not.toHaveBeenCalled();
    }));
});
describe("revokeRequest", () => {
    let requestService;
    let logServiceMock;
    let employeeServiceMock;
    let mockMailer;
    let mockTransporter;
    let notificationServiceMock;
    let requestDbMock;
    let reassignmentServiceMock;
    beforeEach(() => {
        requestDbMock = {
            revokeRequest: globals_1.jest.fn(),
        };
        employeeServiceMock = {
            getEmployee: globals_1.jest.fn(),
        };
        reassignmentServiceMock = {
            getReassignmentActive: globals_1.jest.fn(),
        };
        logServiceMock = {
            logRequestHelper: globals_1.jest.fn(),
        };
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockResolvedValue(null),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestService = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        employeeServiceMock.getEmployee = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should return null if the request does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 1;
        const requestId = 2;
        const reason = "No longer needed";
        requestService.getApprovedRequestByRequestId = globals_1.jest
            .fn()
            .mockResolvedValue(null);
        const result = yield requestService.revokeRequest(performedBy, requestId, reason);
        expect(result).toBeNull();
    }));
    it("should return null if the user is not the reporting manager and no reassignment exists", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 1;
        const requestId = 2;
        const reason = "No longer needed";
        const request = {
            reportingManager: 3,
            requestedDate: new Date(),
            managerName: "Manager Name",
        };
        requestService.getApprovedRequestByRequestId = globals_1.jest
            .fn()
            .mockResolvedValue(request);
        employeeServiceMock.getEmployee.mockResolvedValue({
            dept: "Sales",
            position: "Manager",
        });
        reassignmentServiceMock.getReassignmentActive.mockResolvedValue(null);
        const result = yield requestService.revokeRequest(performedBy, requestId, reason);
        expect(result).toBeNull();
    }));
    it("should return null if the requested date is past", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 1;
        const requestId = 2;
        const reason = "No longer needed";
        const request = {
            reportingManager: 3,
            requestedDate: new Date(Date.now() - 100000000),
            managerName: "Manager Name",
        };
        requestService.getApprovedRequestByRequestId = globals_1.jest
            .fn()
            .mockResolvedValue(request);
        employeeServiceMock.getEmployee.mockResolvedValue({
            dept: "Sales",
            position: "Manager",
        });
        reassignmentServiceMock.getReassignmentActive.mockResolvedValue({
            tempManagerName: "Temp Manager",
        });
        const result = yield requestService.revokeRequest(performedBy, requestId, reason);
        expect(result).toBeNull();
    }));
    it("should return HttpStatusResponse.OK if valid performedBy, requestId and reason", () => __awaiter(void 0, void 0, void 0, function* () {
        const performedBy = 1;
        const requestId = 2;
        const reason = "No longer needed";
        const request = {
            reportingManager: 3,
            requestedDate: new Date(Date.now() + 2),
            managerName: "Manager Name",
        };
        requestService.getApprovedRequestByRequestId = globals_1.jest
            .fn()
            .mockResolvedValue(request);
        employeeServiceMock.getEmployee.mockResolvedValue({
            dept: "Sales",
            position: "Manager",
        });
        reassignmentServiceMock.getReassignmentActive.mockResolvedValue({
            tempManagerName: "Temp Manager",
        });
        requestDbMock.revokeRequest.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        globals_1.jest.spyOn(dateUtils, "checkPastWithdrawalDate").mockReturnValue(false);
        globals_1.jest.spyOn(dateUtils, "checkValidWithdrawalDate").mockReturnValue(true);
        const result = yield requestService.revokeRequest(performedBy, requestId, reason);
        expect(result).toBe(helpers_1.HttpStatusResponse.OK);
        expect(logServiceMock.logRequestHelper).toHaveBeenCalledWith({
            performedBy: performedBy,
            requestType: "APPLICATION",
            action: helpers_1.Action.REVOKE,
            dept: "Sales",
            position: "Manager",
            reason: "No longer needed",
            staffName: "Temp Manager",
            requestId: 2,
        });
    }));
});
