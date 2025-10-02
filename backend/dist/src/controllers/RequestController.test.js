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
const RequestController_1 = __importDefault(require("@/controllers/RequestController"));
const EmployeeDb_1 = __importDefault(require("@/database/EmployeeDb"));
const LogDb_1 = __importDefault(require("@/database/LogDb"));
const ReassignmentDb_1 = __importDefault(require("@/database/ReassignmentDb"));
const RequestDb_1 = __importDefault(require("@/database/RequestDb"));
const helpers_1 = require("@/helpers");
const schema_1 = require("@/schema");
const EmployeeService_1 = __importDefault(require("@/services/EmployeeService"));
const LogService_1 = __importDefault(require("@/services/LogService"));
const ReassignmentService_1 = __importDefault(require("@/services/ReassignmentService"));
const RequestService_1 = __importDefault(require("@/services/RequestService"));
const mailer_1 = __importDefault(require("@/config/mailer"));
const globals_1 = require("@jest/globals");
const UtilsController_1 = __importDefault(require("./UtilsController"));
const NotificationService_1 = __importDefault(require("@/services/NotificationService"));
describe("RequestController", () => {
    let requestController;
    let requestServiceMock;
    let requestDbMock;
    let employeeDbMock;
    let reassignmentDbMock;
    let reassignmentServiceMock;
    let employeeServiceMock;
    let mockMailer;
    let ctx;
    let logDbMock;
    let logServiceMock;
    let notificationServiceMock;
    beforeEach(() => {
        requestDbMock = new RequestDb_1.default();
        employeeDbMock = new EmployeeDb_1.default();
        reassignmentDbMock = new ReassignmentDb_1.default();
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        mockMailer = mailer_1.default.getInstance();
        logDbMock = new LogDb_1.default();
        logServiceMock = new LogService_1.default(logDbMock, employeeServiceMock, reassignmentDbMock);
        reassignmentServiceMock = new ReassignmentService_1.default(reassignmentDbMock, requestDbMock, employeeServiceMock, logServiceMock, notificationServiceMock);
        notificationServiceMock = new NotificationService_1.default(employeeServiceMock, mockMailer);
        requestServiceMock = new RequestService_1.default(logServiceMock, employeeServiceMock, notificationServiceMock, requestDbMock, reassignmentServiceMock);
        requestController = new RequestController_1.default(requestServiceMock);
        ctx = {
            method: "POST",
            query: {},
            body: {},
            request: { body: {} },
            response: {},
        };
        requestServiceMock.postRequest = globals_1.jest.fn();
        globals_1.jest.resetAllMocks();
    });
    it("should return an error when missing parameters", () => __awaiter(void 0, void 0, void 0, function* () {
        yield requestController.postRequest(ctx);
        expect(ctx.body).toEqual({
            errMsg: {
                _errors: [],
                staffId: {
                    _errors: ["Required"],
                },
                requestedDates: {
                    _errors: ["Required"],
                },
                reason: {
                    _errors: ["Required"],
                },
            },
        });
    }));
    it("should return a (success{message, dates}, error, note) object when a valid date is inputted", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "IT",
            requestedDates: [
                ["2024-09-19", "FULL"],
                ["2024-09-20", "FULL"],
            ],
            reason: "Take care of mother",
        };
        const expectedServiceResponse = {
            successDates: [
                ["2024-09-19", "FULL"],
                ["2024-09-20", "FULL"],
            ],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [],
        };
        const expectedResponse = {
            success: {
                message: helpers_1.successMsg,
                dates: [
                    ["2024-09-19", "FULL"],
                    ["2024-09-20", "FULL"],
                ],
            },
            error: [],
            note: {
                message: "",
                dates: [],
            },
        };
        requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
        yield requestController.postRequest(ctx);
        expect(ctx.body).toEqual(expectedResponse);
        expect(requestServiceMock.postRequest).toHaveBeenCalledWith(ctx.request.body);
    }));
    it("should return a (success{message, dates}, error, note{message, dates}) object when a valid date is inputted", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "IT",
            requestedDates: [
                ["2024-09-19", "FULL"],
                ["2024-09-20", "FULL"],
            ],
            reason: "Take care of mother",
        };
        const expectedServiceResponse = {
            successDates: [
                ["2024-09-19", "FULL"],
                ["2024-09-20", "FULL"],
            ],
            noteDates: [["2024-09-20", "FULL"]],
            errorDates: [],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [],
        };
        const expectedResponse = {
            success: {
                message: helpers_1.successMsg,
                dates: [
                    ["2024-09-19", "FULL"],
                    ["2024-09-20", "FULL"],
                ],
            },
            error: [],
            note: {
                message: helpers_1.noteMsg,
                dates: [["2024-09-20", "FULL"]],
            },
        };
        requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
        yield requestController.postRequest(ctx);
        expect(ctx.body).toEqual(expectedResponse);
        expect(requestServiceMock.postRequest).toHaveBeenCalledWith(ctx.request.body);
    }));
    it("should return a (success{message, dates}, error[duplicate], note) object when a duplicated date is inputted", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "IT",
            requestedDates: [
                ["2024-09-20", "FULL"],
                ["2024-09-20", "FULL"],
            ],
            reason: "Take care of mother",
        };
        const expectedServiceResponse = {
            successDates: [["2024-09-20", "FULL"]],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [["2024-09-20", "FULL"]],
            insertErrorDates: [],
        };
        const expectedResponse = {
            success: {
                message: helpers_1.successMsg,
                dates: [["2024-09-20", "FULL"]],
            },
            error: [
                {
                    message: helpers_1.errMsg.DUPLICATE_DATE,
                    dates: [["2024-09-20", "FULL"]],
                },
            ],
            note: {
                message: "",
                dates: [],
            },
        };
        requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
        yield requestController.postRequest(ctx);
        expect(ctx.body).toEqual(expectedResponse);
        expect(requestServiceMock.postRequest).toHaveBeenCalledWith(ctx.request.body);
    }));
    it("should return a (success, error[weekend], note) object when a weekend is inputted", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "IT",
            requestedDates: [["2024-09-21", "FULL"]],
            reason: "Take care of mother",
        };
        const expectedServiceResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [],
            weekendDates: [["2024-09-21", "FULL"]],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [],
        };
        const expectedResponse = {
            success: {
                message: "",
                dates: [],
            },
            error: [
                {
                    message: helpers_1.errMsg.WEEKEND_REQUEST,
                    dates: [["2024-09-21", "FULL"]],
                },
            ],
            note: {
                message: "",
                dates: [],
            },
        };
        requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
        yield requestController.postRequest(ctx);
        expect(ctx.body).toEqual(expectedResponse);
        expect(requestServiceMock.postRequest).toHaveBeenCalledWith(ctx.request.body);
    }));
    it("should return a (success, error[pastDate], note) object when a past date is inputted", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "IT",
            requestedDates: [["2024-08-21", "FULL"]],
            reason: "Take care of mother",
        };
        const expectedServiceResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [["2024-08-21", "FULL"]],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [],
        };
        const expectedResponse = {
            success: {
                message: "",
                dates: [],
            },
            error: [
                {
                    message: helpers_1.errMsg.PAST_DATE,
                    dates: [["2024-08-21", "FULL"]],
                },
            ],
            note: {
                message: "",
                dates: [],
            },
        };
        requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
        yield requestController.postRequest(ctx);
        expect(ctx.body).toEqual(expectedResponse);
        expect(requestServiceMock.postRequest).toHaveBeenCalledWith(ctx.request.body);
    }));
    it("should return a (success, error[pastDeadline], note) object when a date that is past application deadline is inputted", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "IT",
            requestedDates: [["2024-09-21", "FULL"]],
            reason: "Take care of mother",
        };
        const expectedServiceResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [["2024-08-21", "FULL"]],
            duplicateDates: [],
            insertErrorDates: [],
        };
        const expectedResponse = {
            success: {
                message: "",
                dates: [],
            },
            error: [
                {
                    message: helpers_1.errMsg.PAST_DEADLINE,
                    dates: [["2024-08-21", "FULL"]],
                },
            ],
            note: {
                message: "",
                dates: [],
            },
        };
        requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
        yield requestController.postRequest(ctx);
        expect(ctx.body).toEqual(expectedResponse);
        expect(requestServiceMock.postRequest).toHaveBeenCalledWith(ctx.request.body);
    }));
    it("should return a (success, error[insertError], note) object when a there is a DB insert error", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "IT",
            requestedDates: [["2024-09-21", "FULL"]],
            reason: "Take care of mother",
        };
        const expectedServiceResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [["2024-09-21", "FULL"]],
        };
        const expectedResponse = {
            success: {
                message: "",
                dates: [],
            },
            error: [
                {
                    message: helpers_1.errMsg.INSERT_ERROR,
                    dates: [["2024-09-21", "FULL"]],
                },
            ],
            note: {
                message: "",
                dates: [],
            },
        };
        requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
        yield requestController.postRequest(ctx);
        expect(ctx.body).toEqual(expectedResponse);
        expect(requestServiceMock.postRequest).toHaveBeenCalledWith(ctx.request.body);
    }));
    it("should return a (success, error[insertError, pastDate], note) object when a there is a DB insert error and a past date is inputted", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "IT",
            requestedDates: [
                ["2024-09-21", "FULL"],
                ["2023-09-21", "FULL"],
            ],
            reason: "Take care of mother",
        };
        const expectedServiceResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [],
            weekendDates: [],
            pastDates: [["2023-09-21", "FULL"]],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [["2024-09-21", "FULL"]],
        };
        const expectedResponse = {
            success: {
                message: "",
                dates: [],
            },
            error: [
                {
                    message: helpers_1.errMsg.PAST_DATE,
                    dates: [["2023-09-21", "FULL"]],
                },
                {
                    message: helpers_1.errMsg.INSERT_ERROR,
                    dates: [["2024-09-21", "FULL"]],
                },
            ],
            note: {
                message: "",
                dates: [],
            },
        };
        requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
        yield requestController.postRequest(ctx);
        expect(ctx.body).toEqual(expectedResponse);
        expect(requestServiceMock.postRequest).toHaveBeenCalledWith(ctx.request.body);
    }));
    it("should return a (success, error[sameDayRequest], note) object when a there is an existing request for the inputted date", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            staffId: 3,
            staffName: "Amy Cheong",
            reportingManager: 1,
            managerName: "John Doe",
            dept: "IT",
            requestedDates: [["2024-09-21", "FULL"]],
            reason: "Take care of mother",
        };
        const expectedServiceResponse = {
            successDates: [],
            noteDates: [],
            errorDates: [["2023-09-21", "FULL"]],
            weekendDates: [],
            pastDates: [],
            pastDeadlineDates: [],
            duplicateDates: [],
            insertErrorDates: [],
        };
        const expectedResponse = {
            success: {
                message: "",
                dates: [],
            },
            error: [
                {
                    message: helpers_1.errMsg.SAME_DAY_REQUEST,
                    dates: [["2023-09-21", "FULL"]],
                },
            ],
            note: {
                message: "",
                dates: [],
            },
        };
        requestServiceMock.postRequest.mockResolvedValue(expectedServiceResponse);
        yield requestController.postRequest(ctx);
        expect(ctx.body).toEqual(expectedResponse);
        expect(requestServiceMock.postRequest).toHaveBeenCalledWith(ctx.request.body);
    }));
});
describe("cancelPendingRequests", () => {
    let requestController;
    let mockRequestService;
    let ctx;
    beforeEach(() => {
        mockRequestService = {
            cancelPendingRequests: globals_1.jest.fn(),
        };
        requestController = new RequestController_1.default(mockRequestService);
        ctx = {
            request: {
                body: {
                    staffId: "1",
                    requestId: "2",
                },
            },
            body: {},
        };
    });
    it("should return OK if the request is successfully cancelled", () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequestService.cancelPendingRequests.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        yield requestController.cancelPendingRequests(ctx);
        expect(ctx.body).toBe(helpers_1.HttpStatusResponse.OK);
        expect(mockRequestService.cancelPendingRequests).toHaveBeenCalledWith(1, 2);
    }));
    it("should return NOT_MODIFIED if the request was not modified", () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequestService.cancelPendingRequests.mockResolvedValue(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        yield requestController.cancelPendingRequests(ctx);
        expect(ctx.body).toBe(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        expect(mockRequestService.cancelPendingRequests).toHaveBeenCalledWith(1, 2);
    }));
});
describe("getAllSubordinatesRequests", () => {
    let requestController;
    let mockRequestService;
    let ctx;
    beforeEach(() => {
        mockRequestService = {
            getAllSubordinatesRequests: globals_1.jest.fn(),
        };
        requestController = new RequestController_1.default(mockRequestService);
        ctx = {
            request: {
                header: {
                    id: "1",
                },
            },
            body: {},
        };
    });
    it("should return subordinates requests", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequests = [
            { requestId: 1, status: helpers_1.Status.PENDING },
            { requestId: 2, status: helpers_1.Status.APPROVED },
        ];
        mockRequestService.getAllSubordinatesRequests.mockResolvedValue(mockRequests);
        yield requestController.getAllSubordinatesRequests(ctx);
        expect(ctx.body).toEqual(mockRequests);
        expect(mockRequestService.getAllSubordinatesRequests).toHaveBeenCalledWith(1);
    }));
    it("should handle cases where no requests are found", () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequestService.getAllSubordinatesRequests.mockResolvedValue([]);
        yield requestController.getAllSubordinatesRequests(ctx);
        expect(ctx.body).toEqual([]);
        expect(mockRequestService.getAllSubordinatesRequests).toHaveBeenCalledWith(1);
    }));
    it("should handle errors gracefully", () => __awaiter(void 0, void 0, void 0, function* () {
        const errorMessage = "Service error";
        mockRequestService.getAllSubordinatesRequests.mockRejectedValue(new Error(errorMessage));
        yield expect(requestController.getAllSubordinatesRequests(ctx)).rejects.toThrow(errorMessage);
    }));
});
describe("getOwnPendingRequests", () => {
    let requestController;
    let mockRequestService;
    let ctx;
    beforeEach(() => {
        mockRequestService = {
            getOwnPendingRequests: globals_1.jest.fn(),
        };
        requestController = new RequestController_1.default(mockRequestService);
        ctx = {
            query: {
                myId: "1",
            },
            body: {},
        };
    });
    it("should return pending requests for the given myId", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockPendingRequests = [
            { requestId: 1, status: "pending" },
            { requestId: 2, status: "pending" },
        ];
        mockRequestService.getOwnPendingRequests.mockResolvedValue(mockPendingRequests);
        yield requestController.getOwnPendingRequests(ctx);
        expect(ctx.body).toEqual(mockPendingRequests);
        expect(mockRequestService.getOwnPendingRequests).toHaveBeenCalledWith(1);
    }));
    it("should handle cases where no pending requests are found", () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequestService.getOwnPendingRequests.mockResolvedValue([]);
        yield requestController.getOwnPendingRequests(ctx);
        expect(ctx.body).toEqual([]);
        expect(mockRequestService.getOwnPendingRequests).toHaveBeenCalledWith(1);
    }));
    it("should throw an error if myId is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.query.myId = undefined;
        const throwAPIErrorSpy = globals_1.jest
            .spyOn(UtilsController_1.default, "throwAPIError")
            .mockImplementation(() => { });
        yield requestController.getOwnPendingRequests(ctx);
        expect(throwAPIErrorSpy).toHaveBeenCalledWith(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
        expect(ctx.body).toEqual({});
    }));
    it("should handle errors from the service gracefully", () => __awaiter(void 0, void 0, void 0, function* () {
        const errorMessage = "Service error";
        mockRequestService.getOwnPendingRequests.mockRejectedValue(new Error(errorMessage));
        yield expect(requestController.getOwnPendingRequests(ctx)).rejects.toThrow(errorMessage);
    }));
});
describe("getMySchedule", () => {
    let requestController;
    let mockRequestService;
    let ctx;
    beforeEach(() => {
        mockRequestService = {
            getMySchedule: globals_1.jest.fn(),
        };
        requestController = new RequestController_1.default(mockRequestService);
        ctx = {
            query: {
                myId: "1",
            },
            body: {},
        };
    });
    it("should return schedule for the given myId", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockSchedule = [{ date: "2024-10-20", event: "Meeting" }];
        mockRequestService.getMySchedule.mockResolvedValue(mockSchedule);
        yield requestController.getMySchedule(ctx);
        expect(ctx.body).toEqual(mockSchedule);
        expect(mockRequestService.getMySchedule).toHaveBeenCalledWith(1);
    }));
    it("should handle cases where no schedule is found", () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequestService.getMySchedule.mockResolvedValue([]);
        yield requestController.getMySchedule(ctx);
        expect(ctx.body).toEqual([]);
        expect(mockRequestService.getMySchedule).toHaveBeenCalledWith(1);
    }));
    it("should throw an error if myId is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.query.myId = undefined;
        const throwAPIErrorSpy = globals_1.jest
            .spyOn(UtilsController_1.default, "throwAPIError")
            .mockImplementation(() => { });
        yield requestController.getMySchedule(ctx);
        expect(throwAPIErrorSpy).toHaveBeenCalledWith(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
        expect(ctx.body).toEqual({});
    }));
    it("should handle errors from the service gracefully", () => __awaiter(void 0, void 0, void 0, function* () {
        const errorMessage = "Service error";
        mockRequestService.getMySchedule.mockRejectedValue(new Error(errorMessage));
        yield expect(requestController.getMySchedule(ctx)).rejects.toThrow(errorMessage);
    }));
});
describe("getSchedule", () => {
    let requestController;
    let mockRequestService;
    let ctx;
    beforeEach(() => {
        mockRequestService = {
            getSchedule: globals_1.jest.fn(),
        };
        requestController = new RequestController_1.default(mockRequestService);
        ctx = {
            request: {
                header: {
                    id: "1",
                },
            },
            body: {},
        };
    });
    it("should return schedule for the given id", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockSchedule = [{ date: "2024-10-20", event: "Meeting" }];
        mockRequestService.getSchedule.mockResolvedValue(mockSchedule);
        yield requestController.getSchedule(ctx);
        expect(ctx.body).toEqual(mockSchedule);
        expect(mockRequestService.getSchedule).toHaveBeenCalledWith(1);
    }));
    it("should handle cases where no schedule is found", () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequestService.getSchedule.mockResolvedValue([]);
        yield requestController.getSchedule(ctx);
        expect(ctx.body).toEqual([]);
        expect(mockRequestService.getSchedule).toHaveBeenCalledWith(1);
    }));
    it("should return error message when validation fails", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.header.id = "invalid-id"; // Set an invalid id
        schema_1.staffIdSchema.safeParse = globals_1.jest.fn().mockReturnValue({
            success: false,
            error: {
                format: globals_1.jest.fn().mockReturnValue("Invalid Id format"),
            },
        });
        yield requestController.getSchedule(ctx);
        expect(ctx.body).toEqual({
            errMsg: "Invalid Id format",
        });
    }));
});
describe("approveRequest", () => {
    let requestController;
    let mockRequestService;
    let ctx;
    beforeEach(() => {
        mockRequestService = {
            approveRequest: globals_1.jest.fn(),
        };
        requestController = new RequestController_1.default(mockRequestService);
        ctx = {
            request: {
                body: {},
            },
            body: {},
        };
    });
    it("should return error message when validation fails", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = { invalidField: "data" };
        schema_1.approvalSchema.safeParse = globals_1.jest.fn().mockReturnValue({
            success: false,
            error: {
                format: globals_1.jest.fn().mockReturnValue("Invalid approval details"),
            },
        });
        yield requestController.approveRequest(ctx);
        expect(ctx.body).toEqual({
            errMsg: "Invalid approval details",
        });
    }));
    it("should call approveRequest with valid details", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            performedBy: "1",
            requestId: "2",
        };
        schema_1.approvalSchema.safeParse = globals_1.jest.fn().mockReturnValue({
            success: true,
        });
        mockRequestService.approveRequest.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        yield requestController.approveRequest(ctx);
        expect(mockRequestService.approveRequest).toHaveBeenCalledWith(1, 2);
        expect(ctx.body).toEqual(helpers_1.HttpStatusResponse.OK);
    }));
    it("should return NOT_MODIFIED if approveRequest result is not OK", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            performedBy: "1",
            requestId: "2",
        };
        schema_1.approvalSchema.safeParse = globals_1.jest.fn().mockReturnValue({
            success: true,
        });
        mockRequestService.approveRequest.mockResolvedValue(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        yield requestController.approveRequest(ctx);
        expect(mockRequestService.approveRequest).toHaveBeenCalledWith(1, 2);
        expect(ctx.body).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
    }));
});
describe("rejectRequest", () => {
    let requestController;
    let mockRequestService;
    let ctx;
    beforeEach(() => {
        mockRequestService = {
            rejectRequest: globals_1.jest.fn(),
        };
        requestController = new RequestController_1.default(mockRequestService);
        ctx = {
            request: {
                body: {},
            },
            body: {},
        };
    });
    it("should return error message when validation fails", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = { invalidField: "data" };
        schema_1.rejectionSchema.safeParse = globals_1.jest.fn().mockReturnValue({
            success: false,
            error: {
                format: globals_1.jest.fn().mockReturnValue("Invalid rejection details"),
            },
        });
        yield requestController.rejectRequest(ctx);
        expect(ctx.body).toEqual({
            errMsg: "Invalid rejection details",
        });
    }));
    it("should call rejectRequest with valid details", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            performedBy: "1",
            requestId: "2",
            reason: "Not needed anymore",
        };
        schema_1.rejectionSchema.safeParse = globals_1.jest.fn().mockReturnValue({
            success: true,
        });
        mockRequestService.rejectRequest.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        yield requestController.rejectRequest(ctx);
        expect(mockRequestService.rejectRequest).toHaveBeenCalledWith(1, 2, "Not needed anymore");
        expect(ctx.body).toEqual(helpers_1.HttpStatusResponse.OK);
    }));
    it("should return NOT_MODIFIED if rejectRequest result is not OK", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            performedBy: "1",
            requestId: "2",
            reason: "Not needed anymore",
        };
        schema_1.rejectionSchema.safeParse = globals_1.jest.fn().mockReturnValue({
            success: true,
        });
        mockRequestService.rejectRequest.mockResolvedValue(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        yield requestController.rejectRequest(ctx);
        expect(mockRequestService.rejectRequest).toHaveBeenCalledWith(1, 2, "Not needed anymore");
        expect(ctx.body).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
    }));
});
describe("revokeRequest", () => {
    let requestController;
    let mockRequestService;
    let ctx;
    beforeEach(() => {
        mockRequestService = {
            revokeRequest: globals_1.jest.fn(),
        };
        requestController = new RequestController_1.default(mockRequestService);
        ctx = {
            request: {
                body: {},
            },
            body: {},
        };
    });
    it("should return error message when validation fails", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = { invalidField: "data" };
        schema_1.revocationSchema.safeParse = globals_1.jest.fn().mockReturnValue({
            success: false,
            error: {
                format: globals_1.jest.fn().mockReturnValue("Invalid revocation details"),
            },
        });
        yield requestController.revokeRequest(ctx);
        expect(ctx.body).toEqual({
            errMsg: "Invalid revocation details",
        });
    }));
    it("should call revokeRequest with valid details", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            performedBy: "1",
            requestId: "2",
            reason: "Revoking for testing",
        };
        schema_1.revocationSchema.safeParse = globals_1.jest.fn().mockReturnValue({
            success: true,
        });
        mockRequestService.revokeRequest.mockResolvedValue(helpers_1.HttpStatusResponse.OK);
        yield requestController.revokeRequest(ctx);
        expect(mockRequestService.revokeRequest).toHaveBeenCalledWith(1, 2, "Revoking for testing");
        expect(ctx.body).toEqual(helpers_1.HttpStatusResponse.OK);
    }));
    it("should return NOT_MODIFIED if revokeRequest result is not OK", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.body = {
            performedBy: "1",
            requestId: "2",
            reason: "Revoking for testing",
        };
        schema_1.revocationSchema.safeParse = globals_1.jest.fn().mockReturnValue({
            success: true,
        });
        mockRequestService.revokeRequest.mockResolvedValue(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        yield requestController.revokeRequest(ctx);
        expect(mockRequestService.revokeRequest).toHaveBeenCalledWith(1, 2, "Revoking for testing");
        expect(ctx.body).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
    }));
});
