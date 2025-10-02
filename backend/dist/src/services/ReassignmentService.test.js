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
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const ReassignmentService_1 = __importDefault(require("./ReassignmentService"));
dayjs_1.default.extend(utc_1.default);
describe("insertReassignmentRequest", () => {
    let reassignmentService;
    let mockEmployeeService;
    let mockReassignmentDb;
    let mockRequestDb;
    let mockLogService;
    let mockNotificationService;
    const staffId = "123";
    const tempReportingManagerId = "456";
    const currentManager = {
        staffFName: "John",
        staffLName: "Doe",
        dept: "Sales",
        position: "Manager",
    };
    const tempReportingManager = {
        staffFName: "Jane",
        staffLName: "Smith",
    };
    const reassignmentRequest = {
        staffId,
        tempReportingManagerId,
        startDate: (0, dayjs_1.default)().add(1, "day").utc(true).toISOString(),
        endDate: (0, dayjs_1.default)().subtract(30, "day").utc(true).toISOString(),
    };
    beforeEach(() => {
        mockEmployeeService = {
            getEmployee: jest.fn(),
        };
        mockReassignmentDb = {
            hasNonRejectedReassignment: jest.fn(),
            insertReassignmentRequest: jest.fn(),
        };
        mockLogService = {
            logRequestHelper: jest.fn(),
        };
        reassignmentService = new ReassignmentService_1.default(mockReassignmentDb, mockRequestDb, mockEmployeeService, mockLogService, mockNotificationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should fail if startDate is in the past", () => __awaiter(void 0, void 0, void 0, function* () {
        const pastDate = (0, dayjs_1.default)()
            .startOf("day")
            .subtract(1, "day")
            .utc(true)
            .toISOString();
        const reassignmentRequest = {
            staffId,
            tempReportingManagerId,
            startDate: pastDate,
            endDate: (0, dayjs_1.default)().subtract(30, "day").utc(true).toISOString(),
        };
        const result = yield reassignmentService.insertReassignmentRequest(reassignmentRequest);
        expect(result).toBe(helpers_1.errMsg.PAST_DATE_NOT_ALLOWED);
    }));
    it("should fail if startDate is today", () => __awaiter(void 0, void 0, void 0, function* () {
        const todayDate = (0, dayjs_1.default)().startOf("day").utc(true).toISOString();
        const reassignmentRequest = {
            staffId,
            tempReportingManagerId,
            startDate: todayDate,
            endDate: (0, dayjs_1.default)().subtract(30, "day").utc(true).toISOString(),
        };
        const result = yield reassignmentService.insertReassignmentRequest(reassignmentRequest);
        expect(result).toBe(helpers_1.errMsg.CURRENT_DATE_NOT_ALLOWED);
    }));
    it("should return error message if there is a non-rejected reassignment", () => __awaiter(void 0, void 0, void 0, function* () {
        mockEmployeeService.getEmployee
            .mockResolvedValueOnce(currentManager)
            .mockResolvedValueOnce(tempReportingManager);
        mockReassignmentDb.hasNonRejectedReassignment.mockResolvedValue(true);
        const result = yield reassignmentService.insertReassignmentRequest(reassignmentRequest);
        expect(result).toBe(helpers_1.errMsg.NON_REJECTED_REASSIGNMENT);
        expect(mockReassignmentDb.insertReassignmentRequest).not.toHaveBeenCalled();
    }));
});
describe("getReassignmentStatus", () => {
    let reassignmentService;
    let mockEmployeeService;
    let mockReassignmentDb;
    let mockRequestDb;
    let mockLogService;
    let mockNotificationService;
    const staffId = 1;
    const employeeData = {
        staffFName: "John",
        staffLName: "Doe",
        dept: "Engineering",
        position: "Senior Engineers",
    };
    const reassignmentRequest = {
        id: 1,
        status: "PENDING",
    };
    beforeEach(() => {
        mockEmployeeService = {
            getEmployee: jest.fn(),
        };
        mockReassignmentDb = {
            getReassignmentRequest: jest.fn(),
        };
        mockLogService = {
            logRequestHelper: jest.fn(),
        };
        reassignmentService = new ReassignmentService_1.default(mockReassignmentDb, mockRequestDb, mockEmployeeService, mockLogService, mockNotificationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should retrieve reassignment status and log the request", () => __awaiter(void 0, void 0, void 0, function* () {
        mockEmployeeService.getEmployee.mockResolvedValue(employeeData);
        mockReassignmentDb.getReassignmentRequest.mockResolvedValue(reassignmentRequest);
        const result = yield reassignmentService.getReassignmentStatus(staffId);
        expect(mockEmployeeService.getEmployee).toHaveBeenCalledWith(staffId);
        expect(mockLogService.logRequestHelper).toHaveBeenCalledWith({
            performedBy: staffId,
            requestType: helpers_1.Request.REASSIGNMENT,
            action: helpers_1.Action.RETRIEVE,
            staffName: "John Doe",
            dept: "Engineering",
            position: "Senior Engineers",
        });
        expect(mockReassignmentDb.getReassignmentRequest).toHaveBeenCalledWith(staffId);
        expect(result).toEqual(reassignmentRequest);
    }));
});
describe("getTempMgrReassignmentStatus", () => {
    let reassignmentService;
    let mockEmployeeService;
    let mockReassignmentDb;
    let mockRequestDb;
    let mockLogService;
    let mockNotificationService;
    const staffId = 1;
    const employeeData = {
        staffFName: "John",
        staffLName: "Doe",
        dept: "Engineering",
        position: "Senior Engineer",
    };
    const tempMgrReassignmentRequest = {
        id: 1,
        status: "PENDING",
    };
    beforeEach(() => {
        mockEmployeeService = {
            getEmployee: jest.fn(),
        };
        mockReassignmentDb = {
            getTempMgrReassignmentRequest: jest.fn(),
        };
        mockLogService = {
            logRequestHelper: jest.fn(),
        };
        reassignmentService = new ReassignmentService_1.default(mockReassignmentDb, mockRequestDb, mockEmployeeService, mockLogService, mockNotificationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should retrieve temporary manager reassignment status and log the request", () => __awaiter(void 0, void 0, void 0, function* () {
        mockEmployeeService.getEmployee.mockResolvedValue(employeeData);
        mockReassignmentDb.getTempMgrReassignmentRequest.mockResolvedValue(tempMgrReassignmentRequest);
        const result = yield reassignmentService.getTempMgrReassignmentStatus(staffId);
        expect(mockEmployeeService.getEmployee).toHaveBeenCalledWith(staffId);
        expect(mockLogService.logRequestHelper).toHaveBeenCalledWith({
            performedBy: staffId,
            requestType: helpers_1.Request.REASSIGNMENT,
            action: helpers_1.Action.RETRIEVE,
            staffName: "John Doe",
            dept: "Engineering",
            position: "Senior Engineer",
        });
        expect(mockReassignmentDb.getTempMgrReassignmentRequest).toHaveBeenCalledWith(staffId);
        expect(result).toEqual(tempMgrReassignmentRequest);
    }));
});
describe("setActiveReassignmentPeriod", () => {
    let reassignmentService;
    let mockReassignmentDb;
    let mockRequestDb;
    let mockEmployeeService;
    let mockLogService;
    let mockNotificationService;
    beforeEach(() => {
        mockReassignmentDb = {
            setActiveReassignmentPeriod: jest.fn(),
        };
        mockLogService = {
            logRequestHelper: jest.fn(),
        };
        reassignmentService = new ReassignmentService_1.default(mockReassignmentDb, mockRequestDb, mockEmployeeService, mockLogService, mockNotificationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should set the active reassignment period and log the action", () => __awaiter(void 0, void 0, void 0, function* () {
        mockReassignmentDb.setActiveReassignmentPeriod.mockResolvedValue(true);
        yield reassignmentService.setActiveReassignmentPeriod();
        expect(mockReassignmentDb.setActiveReassignmentPeriod).toHaveBeenCalled();
        expect(mockLogService.logRequestHelper).toHaveBeenCalledWith({
            performedBy: helpers_1.PerformedBy.SYSTEM,
            requestType: helpers_1.Request.REASSIGNMENT,
            action: helpers_1.Action.SET_ACTIVE,
            dept: helpers_1.PerformedBy.SYSTEM,
            position: helpers_1.PerformedBy.SYSTEM,
        });
    }));
    it("should not log if the active reassignment period is not updated", () => __awaiter(void 0, void 0, void 0, function* () {
        mockReassignmentDb.setActiveReassignmentPeriod.mockResolvedValue(false);
        yield reassignmentService.setActiveReassignmentPeriod();
        expect(mockReassignmentDb.setActiveReassignmentPeriod).toHaveBeenCalled();
        expect(mockLogService.logRequestHelper).not.toHaveBeenCalled();
    }));
});
describe("setInactiveReassignmentPeriod", () => {
    let reassignmentService;
    let mockReassignmentDb;
    let mockRequestDb;
    let mockEmployeeService;
    let mockLogService;
    let mockNotificationService;
    beforeEach(() => {
        mockReassignmentDb = {
            setInactiveReassignmentPeriod: jest.fn(),
        };
        mockLogService = {
            logRequestHelper: jest.fn(),
        };
        reassignmentService = new ReassignmentService_1.default(mockReassignmentDb, mockRequestDb, mockEmployeeService, mockLogService, mockNotificationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should set the inactive reassignment period and log the action", () => __awaiter(void 0, void 0, void 0, function* () {
        mockReassignmentDb.setInactiveReassignmentPeriod.mockResolvedValue(true);
        yield reassignmentService.setInactiveReassignmentPeriod();
        expect(mockReassignmentDb.setInactiveReassignmentPeriod).toHaveBeenCalled();
        expect(mockLogService.logRequestHelper).toHaveBeenCalledWith({
            performedBy: helpers_1.PerformedBy.SYSTEM,
            requestType: helpers_1.Request.REASSIGNMENT,
            action: helpers_1.Action.SET_INACTIVE,
            dept: helpers_1.PerformedBy.SYSTEM,
            position: helpers_1.PerformedBy.SYSTEM,
        });
    }));
    it("should not log if the inactive reassignment period is not updated", () => __awaiter(void 0, void 0, void 0, function* () {
        mockReassignmentDb.setInactiveReassignmentPeriod.mockResolvedValue(false);
        yield reassignmentService.setInactiveReassignmentPeriod();
        expect(mockReassignmentDb.setInactiveReassignmentPeriod).toHaveBeenCalled();
        expect(mockLogService.logRequestHelper).not.toHaveBeenCalled();
    }));
});
describe("getReassignmentActive", () => {
    let reassignmentService;
    let mockReassignmentDb;
    let mockRequestDb;
    let mockEmployeeService;
    let mockLogService;
    let mockNotificationService;
    const staffId = 1;
    const tempReportingManagerId = 2;
    const expectedActiveFlag = true;
    beforeEach(() => {
        mockReassignmentDb = {
            getReassignmentActive: jest.fn(),
        };
        reassignmentService = new ReassignmentService_1.default(mockReassignmentDb, mockRequestDb, mockEmployeeService, mockLogService, mockNotificationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return the active reassignment flag", () => __awaiter(void 0, void 0, void 0, function* () {
        mockReassignmentDb.getReassignmentActive.mockResolvedValue(expectedActiveFlag);
        const result = yield reassignmentService.getReassignmentActive(staffId, tempReportingManagerId);
        expect(mockReassignmentDb.getReassignmentActive).toHaveBeenCalledWith(staffId, tempReportingManagerId);
        expect(result).toBe(expectedActiveFlag);
    }));
});
describe("getActiveReassignmentAsTempManager", () => {
    let reassignmentService;
    let mockReassignmentDb;
    let mockRequestDb;
    let mockEmployeeService;
    let mockLogService;
    let mockNotificationService;
    const staffId = 1;
    const expectedActiveReassignments = [
        { id: 1, staffId: 2, tempReportingManagerId: staffId, status: "ACTIVE" },
        { id: 2, staffId: 3, tempReportingManagerId: staffId, status: "ACTIVE" },
    ];
    beforeEach(() => {
        mockReassignmentDb = {
            getActiveReassignmentAsTempManager: jest.fn(),
        };
        reassignmentService = new ReassignmentService_1.default(mockReassignmentDb, mockRequestDb, mockEmployeeService, mockLogService, mockNotificationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return active reassignments for the temporary manager", () => __awaiter(void 0, void 0, void 0, function* () {
        mockReassignmentDb.getActiveReassignmentAsTempManager.mockResolvedValue(expectedActiveReassignments);
        const result = yield reassignmentService.getActiveReassignmentAsTempManager(staffId);
        expect(mockReassignmentDb.getActiveReassignmentAsTempManager).toHaveBeenCalledWith(staffId);
        expect(result).toEqual(expectedActiveReassignments);
    }));
});
describe("getIncomingReassignmentRequests", () => {
    let reassignmentService;
    let mockReassignmentDb;
    let mockRequestDb;
    let mockEmployeeService;
    let mockLogService;
    let mockNotificationService;
    const staffId = 1;
    const expectedActiveReassignments = [
        { id: 1, staffId: 2, tempReportingManagerId: staffId, status: "ACTIVE" },
        { id: 2, staffId: 3, tempReportingManagerId: staffId, status: "ACTIVE" },
    ];
    beforeEach(() => {
        mockReassignmentDb = {
            getIncomingReassignmentRequests: jest.fn(),
        };
        reassignmentService = new ReassignmentService_1.default(mockReassignmentDb, mockRequestDb, mockEmployeeService, mockLogService, mockNotificationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return incoming reassignments for the temporary manager", () => __awaiter(void 0, void 0, void 0, function* () {
        mockReassignmentDb.getIncomingReassignmentRequests.mockResolvedValue(expectedActiveReassignments);
        const result = yield reassignmentService.getIncomingReassignmentRequests(staffId);
        expect(mockReassignmentDb.getIncomingReassignmentRequests).toHaveBeenCalledWith(staffId);
        expect(result).toEqual(expectedActiveReassignments);
    }));
});
describe("handleReassignmentRequest", () => {
    let reassignmentService;
    let mockReassignmentDb;
    let mockRequestDb;
    let mockEmployeeService;
    let mockLogService;
    let mockNotificationService;
    const staffId = 1;
    const reassignmentId = 2;
    beforeEach(() => {
        mockReassignmentDb = {
            getIncomingReassignmentRequests: jest.fn(),
            updateReassignmentStatus: jest.fn(),
        };
        mockEmployeeService = {
            getEmployee: jest.fn(),
        };
        reassignmentService = new ReassignmentService_1.default(mockReassignmentDb, mockRequestDb, mockEmployeeService, mockLogService, mockNotificationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should approve the reassignment request", () => __awaiter(void 0, void 0, void 0, function* () {
        const reassignment = [
            { tempReportingManagerId: staffId, status: helpers_1.Status.PENDING },
        ];
        mockReassignmentDb.getIncomingReassignmentRequests.mockResolvedValue(reassignment);
        yield reassignmentService.handleReassignmentRequest(staffId, reassignmentId, helpers_1.Action.APPROVE);
        expect(mockReassignmentDb.updateReassignmentStatus).toHaveBeenCalledWith(reassignmentId, helpers_1.Status.APPROVED);
    }));
    it("should reject the reassignment request", () => __awaiter(void 0, void 0, void 0, function* () {
        const reassignment = [
            { tempReportingManagerId: staffId, status: helpers_1.Status.PENDING },
        ];
        mockReassignmentDb.getIncomingReassignmentRequests.mockResolvedValue(reassignment);
        yield reassignmentService.handleReassignmentRequest(staffId, reassignmentId, helpers_1.Action.REJECT);
        expect(mockReassignmentDb.updateReassignmentStatus).toHaveBeenCalledWith(reassignmentId, helpers_1.Status.REJECTED);
    }));
    it("should throw an error if reassignment request is not found", () => __awaiter(void 0, void 0, void 0, function* () {
        mockReassignmentDb.getIncomingReassignmentRequests.mockResolvedValue(null);
        yield expect(reassignmentService.handleReassignmentRequest(staffId, reassignmentId, helpers_1.Action.APPROVE)).rejects.toThrow("Reassignment request not found");
    }));
    it("should throw an error if the staff member is not authorized", () => __awaiter(void 0, void 0, void 0, function* () {
        const reassignment = [
            { tempReportingManagerId: 99, status: helpers_1.Status.PENDING },
        ];
        mockReassignmentDb.getIncomingReassignmentRequests.mockResolvedValue(reassignment);
        yield expect(reassignmentService.handleReassignmentRequest(staffId, reassignmentId, helpers_1.Action.APPROVE)).rejects.toThrow("Unauthorized to perform this action");
    }));
    it("should throw an error if the request has already been processed", () => __awaiter(void 0, void 0, void 0, function* () {
        const reassignment = [
            { tempReportingManagerId: staffId, status: helpers_1.Status.APPROVED },
        ];
        mockReassignmentDb.getIncomingReassignmentRequests.mockResolvedValue(reassignment);
        yield expect(reassignmentService.handleReassignmentRequest(staffId, reassignmentId, helpers_1.Action.APPROVE)).rejects.toThrow("This request has already been processed");
    }));
});
describe("getSubordinateRequestsForTempManager", () => {
    let reassignmentService;
    let mockReassignmentDb;
    let mockRequestDb;
    let mockEmployeeService;
    let mockLogService;
    let mockNotificationService;
    const staffId = 1;
    beforeEach(() => {
        mockReassignmentDb = {
            getActiveReassignmentAsTempManager: jest.fn(),
        };
        mockRequestDb = {
            getAllSubordinatesRequests: jest.fn(),
        };
        reassignmentService = new ReassignmentService_1.default(mockReassignmentDb, mockRequestDb, mockEmployeeService, mockLogService, mockNotificationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return null if no reassignment found", () => __awaiter(void 0, void 0, void 0, function* () {
        mockReassignmentDb.getActiveReassignmentAsTempManager.mockResolvedValue(null);
        const result = yield reassignmentService.getSubordinateRequestsForTempManager(staffId);
        expect(result).toBeNull();
    }));
    it("should return filtered requests for the subordinate within reassignment dates", () => __awaiter(void 0, void 0, void 0, function* () {
        const reassignment = {
            staffId: 2,
            startDate: "2024-01-01",
            endDate: "2024-01-10",
        };
        const subordinateRequests = [
            { status: helpers_1.Status.APPROVED, requestedDate: "2024-01-05" },
            { status: helpers_1.Status.APPROVED, requestedDate: "2024-01-15" },
            { status: helpers_1.Status.PENDING, requestedDate: "2024-01-12" },
        ];
        mockReassignmentDb.getActiveReassignmentAsTempManager.mockResolvedValue(reassignment);
        mockRequestDb.getAllSubordinatesRequests.mockResolvedValue(subordinateRequests);
        const result = yield reassignmentService.getSubordinateRequestsForTempManager(staffId);
        expect(result).toEqual([
            { status: helpers_1.Status.APPROVED, requestedDate: "2024-01-05" },
            { status: helpers_1.Status.PENDING, requestedDate: "2024-01-12" },
        ]);
    }));
    it("should return all pending requests even if no reassignment dates match", () => __awaiter(void 0, void 0, void 0, function* () {
        const reassignment = {
            staffId: 2,
            startDate: "2024-01-01",
            endDate: "2024-01-10",
        };
        const subordinateRequests = [
            { status: helpers_1.Status.APPROVED, requestedDate: "2024-01-15" },
            { status: helpers_1.Status.PENDING, requestedDate: "2024-01-12" },
        ];
        mockReassignmentDb.getActiveReassignmentAsTempManager.mockResolvedValue(reassignment);
        mockRequestDb.getAllSubordinatesRequests.mockResolvedValue(subordinateRequests);
        const result = yield reassignmentService.getSubordinateRequestsForTempManager(staffId);
        expect(result).toEqual([
            { status: helpers_1.Status.PENDING, requestedDate: "2024-01-12" },
        ]);
    }));
});
