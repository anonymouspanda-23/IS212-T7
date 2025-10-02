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
const EmployeeController_1 = __importDefault(require("@/controllers/EmployeeController"));
const EmployeeDb_1 = __importDefault(require("@/database/EmployeeDb"));
const helpers_1 = require("@/helpers");
const EmployeeService_1 = __importDefault(require("@/services/EmployeeService"));
const mockData_1 = require("@/tests/mockData");
const UtilsController_1 = __importDefault(require("./UtilsController"));
describe("EmployeeController", () => {
    let employeeController;
    let employeeServiceMock;
    let employeeDbMock;
    let ctx;
    let mockEmployee;
    beforeEach(() => {
        employeeDbMock = new EmployeeDb_1.default();
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        employeeController = new EmployeeController_1.default(employeeServiceMock);
        ctx = {
            method: "POST",
            query: {},
            body: {},
            request: { body: {} },
            response: {},
        };
        mockEmployee = (0, mockData_1.generateMockEmployee)();
        employeeServiceMock.getEmployeeByEmail = jest.fn();
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    it("should return an error when missing parameters", () => __awaiter(void 0, void 0, void 0, function* () {
        // Act
        yield employeeController.getEmployeeByEmail(ctx);
        // Assert
        expect(ctx.body).toEqual({
            error: helpers_1.errMsg.MISSING_PARAMETERS,
        });
    }));
    it("should return employee role when a valid email and password is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        ctx.request.body = {
            staffEmail: "test@example.com",
            staffPassword: "test-password",
        };
        const { staffId, staffFName, staffLName, dept, position, email, reportingManager, role, } = mockEmployee;
        const returnValue = {
            staffId,
            name: `${staffFName} ${staffLName}`,
            dept,
            position,
            email,
            reportingManager,
            role,
        };
        employeeServiceMock.getEmployeeByEmail.mockResolvedValue(returnValue);
        // Act
        yield employeeController.getEmployeeByEmail(ctx);
        // Assert
        expect(ctx.body).toEqual(returnValue);
    }));
    it("should inform user of failure to find an employee with provided email", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        ctx.request.body = {
            staffEmail: "nonexistent@example.com",
            staffPassword: "password",
        };
        employeeServiceMock.getEmployeeByEmail.mockResolvedValue(helpers_1.errMsg.USER_DOES_NOT_EXIST);
        // Act
        yield employeeController.getEmployeeByEmail(ctx);
        // Assert
        expect(ctx.body).toEqual({
            error: helpers_1.errMsg.USER_DOES_NOT_EXIST,
        });
    }));
    it("should inform user of authentication error with valid email", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        ctx.request.body = {
            staffEmail: "test@example.com",
            staffPassword: "password",
        };
        employeeServiceMock.getEmployeeByEmail.mockResolvedValue(helpers_1.errMsg.WRONG_PASSWORD);
        // Act
        yield employeeController.getEmployeeByEmail(ctx);
        // Assert
        expect(ctx.body).toEqual({
            error: helpers_1.errMsg.WRONG_PASSWORD,
        });
    }));
});
describe("EmployeeController", () => {
    let employeeController;
    let employeeService;
    let employeeDb;
    let ctx;
    beforeEach(() => {
        employeeService = new EmployeeService_1.default(employeeDb);
        employeeController = new EmployeeController_1.default(employeeService);
        ctx = {
            query: {},
            body: null,
        };
    });
    it("should return an error if staffId is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const throwAPIErrorSpy = jest.spyOn(UtilsController_1.default, "throwAPIError");
        yield employeeController.getEmployee(ctx);
        expect(throwAPIErrorSpy).toHaveBeenCalledWith(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
    }));
    it("should call getEmployee with the correct staffId and set ctx.body", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockEmployee = { id: 1, name: "John Doe" };
        const staffId = "1";
        ctx.query.staffId = staffId;
        const getEmployeeSpy = jest
            .spyOn(employeeService, "getEmployee")
            .mockResolvedValue(mockEmployee);
        yield employeeController.getEmployee(ctx);
        expect(getEmployeeSpy).toHaveBeenCalledWith(Number(staffId));
        expect(ctx.body).toBe(mockEmployee);
    }));
});
describe("getDeptByManager", () => {
    let employeeController;
    let employeeService;
    let employeeDb;
    let ctx;
    beforeEach(() => {
        employeeService = new EmployeeService_1.default(employeeDb);
        employeeController = new EmployeeController_1.default(employeeService);
        ctx = {
            query: {},
            body: {},
        };
    });
    it("should call getDeptByManager with the correct staffId and set ctx.body", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockDept = { id: 1, name: "Engineering" };
        const staffId = "1";
        ctx.query.staffId = staffId;
        const getDeptByManagerSpy = jest
            .spyOn(employeeService, "getDeptByManager")
            .mockResolvedValue(mockDept);
        yield employeeController.getDeptByManager(ctx);
        expect(getDeptByManagerSpy).toHaveBeenCalledWith(Number(staffId));
        expect(ctx.body).toBe(mockDept);
    }));
    it("should handle errors thrown by getDeptByManager and set ctx.body with error message", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = "1";
        ctx.query.staffId = staffId;
        const errorMessage = "Database connection failed";
        jest
            .spyOn(employeeService, "getDeptByManager")
            .mockRejectedValue(new Error(errorMessage));
        yield employeeController.getDeptByManager(ctx);
        expect(ctx.body).toEqual({ error: errorMessage });
    }));
    it("should handle unknown errors and set ctx.body with a generic error message", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = "1";
        ctx.query.staffId = staffId;
        jest
            .spyOn(employeeService, "getDeptByManager")
            .mockRejectedValue("Unknown error");
        yield employeeController.getDeptByManager(ctx);
        expect(ctx.body).toEqual({ error: "An unknown error occurred" });
    }));
});
describe("getRoleOneOrThreeEmployees", () => {
    let employeeController;
    let employeeService;
    let employeeDb;
    let ctx;
    beforeEach(() => {
        employeeService = new EmployeeService_1.default(employeeDb);
        employeeController = new EmployeeController_1.default(employeeService);
        ctx = {
            request: {
                header: {
                    id: 1,
                },
            },
            body: null,
        };
    });
    it("should set ctx.body with the list of employees", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockEmployees = [
            { id: 1, name: "Alice", role: 1 },
            { id: 2, name: "Bob", role: 2 },
        ];
        const getRoleOneEmployeesSpy = jest
            .spyOn(employeeService, "getRoleOneOrThreeEmployees")
            .mockResolvedValue(mockEmployees);
        yield employeeController.getRoleOneOrThreeEmployees(ctx);
        expect(getRoleOneEmployeesSpy).toHaveBeenCalled();
        expect(ctx.body).toBe(mockEmployees);
    }));
});
