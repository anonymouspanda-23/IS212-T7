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
const EmployeeDb_1 = __importDefault(require("@/database/EmployeeDb"));
const helpers_1 = require("@/helpers");
const EmployeeService_1 = __importDefault(require("@/services/EmployeeService"));
const mockData_1 = require("@/tests/mockData");
describe("EmployeeService", () => {
    let employeeService;
    let employeeDbMock;
    let mockEmployee;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        employeeDbMock = new EmployeeDb_1.default();
        employeeService = new EmployeeService_1.default(employeeDbMock);
        mockEmployee = yield (0, mockData_1.generateMockEmployee)();
        employeeDbMock.getEmployeeByEmail = jest.fn();
    }));
    afterEach(() => {
        jest.resetAllMocks();
    });
    it("should return employee details when a valid email and password is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const staffEmail = "test@example.com";
        const inputPassword = "test-password";
        const returnValue = {
            staffId: mockEmployee.staffId,
            hashedPassword: mockEmployee.hashedPassword,
            role: mockEmployee.role,
        };
        employeeDbMock.getEmployeeByEmail.mockResolvedValue(returnValue);
        // Act
        const result = yield employeeService.getEmployeeByEmail(staffEmail, inputPassword);
        // Assert
        expect(result).toEqual({
            staffId: mockEmployee.staffId,
            hashedPassword: mockEmployee.hashedPassword,
            role: mockEmployee.role,
        });
    }));
    it("should inform user of failure to find an employee with provided email", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const staffEmail = "nonexistent@example.com";
        const inputPassword = "test-password";
        employeeDbMock.getEmployeeByEmail.mockResolvedValue(null);
        // Act
        const result = yield employeeService.getEmployeeByEmail(staffEmail, inputPassword);
        // Assert
        expect(result).toEqual(helpers_1.errMsg.USER_DOES_NOT_EXIST);
    }));
    it("should inform user of authentication error with valid email", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const staffEmail = "test@example.com";
        const inputPassword = "password";
        const returnValue = {
            staffId: mockEmployee.staffId,
            hashedPassword: mockEmployee.hashedPassword,
            role: mockEmployee.role,
        };
        employeeDbMock.getEmployeeByEmail.mockResolvedValue(returnValue);
        // Act
        const result = yield employeeService.getEmployeeByEmail(staffEmail, inputPassword);
        // Assert
        expect(result).toEqual(helpers_1.errMsg.WRONG_PASSWORD);
    }));
});
describe("getRoleOneOrThreeEmployees", () => {
    let employeeService;
    let employeeDbMock;
    const mockEmployees = [
        { id: 1, name: "Alice", role: 1 },
        { id: 2, name: "Bob", role: 3 },
    ];
    beforeEach(() => {
        employeeDbMock = {
            getEmployee: jest.fn(),
            getRoleOneOrThreeEmployees: jest.fn(),
        };
        employeeService = new EmployeeService_1.default(employeeDbMock);
    });
    it("should return the list of employees with role one or three", () => __awaiter(void 0, void 0, void 0, function* () {
        employeeDbMock.getEmployee.mockResolvedValue(mockEmployees[0]);
        employeeDbMock.getRoleOneOrThreeEmployees.mockResolvedValue(mockEmployees[0]);
        const result = yield employeeService.getRoleOneOrThreeEmployees(1);
        expect(result).toEqual(mockEmployees[0]);
    }));
    it("should return an empty array if no employees are found", () => __awaiter(void 0, void 0, void 0, function* () {
        employeeDbMock.getEmployee.mockResolvedValue(mockEmployees[0]);
        employeeDbMock.getRoleOneOrThreeEmployees.mockResolvedValue([]);
        const result = yield employeeService.getRoleOneOrThreeEmployees(1);
        expect(result).toEqual([]);
    }));
});
describe("getAllDeptTeamCount", () => {
    let employeeService;
    let employeeDbMock;
    beforeEach(() => {
        employeeDbMock = {
            getAllDeptTeamCount: jest.fn(),
        };
        employeeService = new EmployeeService_1.default(employeeDbMock);
    });
    it("should return the department team count", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockDeptCount = [
            { dept: "Sales", count: 10 },
            { dept: "Engineering", count: 5 },
        ];
        employeeDbMock.getAllDeptTeamCount.mockResolvedValue(mockDeptCount);
        const result = yield employeeService.getAllDeptTeamCount();
        expect(result).toEqual(mockDeptCount);
    }));
    it("should return an empty array if no department counts are found", () => __awaiter(void 0, void 0, void 0, function* () {
        employeeDbMock.getAllDeptTeamCount.mockResolvedValue([]);
        const result = yield employeeService.getAllDeptTeamCount();
        expect(result).toEqual([]);
    }));
    it("should call getAllDeptTeamCount from employeeDb", () => __awaiter(void 0, void 0, void 0, function* () {
        yield employeeService.getAllDeptTeamCount();
        expect(employeeDbMock.getAllDeptTeamCount).toHaveBeenCalled();
    }));
});
describe("getDeptByManager", () => {
    let employeeService;
    let employeeDbMock;
    beforeEach(() => {
        employeeDbMock = {
            getDeptByManager: jest.fn(),
        };
        employeeService = new EmployeeService_1.default(employeeDbMock);
    });
    it("should return the department by manager", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 1;
        const mockDept = { dept: "Sales", managerId: staffId };
        employeeDbMock.getDeptByManager.mockResolvedValue(mockDept);
        const result = yield employeeService.getDeptByManager(staffId);
        expect(result).toEqual(mockDept);
    }));
    it("should return null if no department is found", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 2;
        employeeDbMock.getDeptByManager.mockResolvedValue(null);
        const result = yield employeeService.getDeptByManager(staffId);
        expect(result).toBeNull();
    }));
    it("should call getDeptByManager from employeeDb with correct staffId", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 3;
        yield employeeService.getDeptByManager(staffId);
        expect(employeeDbMock.getDeptByManager).toHaveBeenCalledWith(staffId);
    }));
});
describe("getEmployee", () => {
    let employeeService;
    let employeeDbMock;
    beforeEach(() => {
        employeeDbMock = {
            getEmployee: jest.fn(),
        };
        employeeService = new EmployeeService_1.default(employeeDbMock);
    });
    it("should return the employee details for a valid staffId", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 1;
        const mockEmployee = { id: staffId, name: "Alice", role: 1 };
        employeeDbMock.getEmployee.mockResolvedValue(mockEmployee);
        const result = yield employeeService.getEmployee(staffId);
        expect(result).toEqual(mockEmployee);
    }));
    it("should return null if no employee is found", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 2;
        employeeDbMock.getEmployee.mockResolvedValue(null);
        const result = yield employeeService.getEmployee(staffId);
        expect(result).toBeNull();
    }));
    it("should call getEmployee from employeeDb with correct staffId", () => __awaiter(void 0, void 0, void 0, function* () {
        const staffId = 3;
        yield employeeService.getEmployee(staffId);
        expect(employeeDbMock.getEmployee).toHaveBeenCalledWith(staffId);
    }));
});
