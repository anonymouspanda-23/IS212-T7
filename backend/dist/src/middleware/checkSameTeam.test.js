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
const UtilsController_1 = __importDefault(require("@/controllers/UtilsController"));
const EmployeeDb_1 = __importDefault(require("@/database/EmployeeDb"));
const helpers_1 = require("@/helpers");
const EmployeeService_1 = __importDefault(require("@/services/EmployeeService"));
const middlewareMockData_1 = require("@/tests/middlewareMockData");
const checkSameTeam_1 = require("./checkSameTeam");
describe("checkSameTeam middleware", () => {
    let employeeServiceMock;
    let employeeDbMock;
    let ctx;
    let next;
    const checkSameTeamMiddleware = (0, checkSameTeam_1.checkSameTeam)();
    beforeEach(() => {
        employeeDbMock = new EmployeeDb_1.default();
        employeeServiceMock = new EmployeeService_1.default(employeeDbMock);
        next = jest.fn();
        EmployeeService_1.default.prototype.getEmployee = jest.fn();
        UtilsController_1.default.throwAPIError = jest.fn();
    });
    it("should throw an error if id is missing in the header", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx = {
            request: {
                header: {},
            },
            query: {
                reportingManager: String(middlewareMockData_1.middlewareMockData.Sales_Manager.staffId),
                dept: helpers_1.Dept.SALES,
            },
        };
        ctx.request.header.id = undefined;
        yield checkSameTeamMiddleware(ctx, next);
        expect(UtilsController_1.default.throwAPIError).toHaveBeenCalledWith(ctx, helpers_1.errMsg.MISSING_HEADER);
        expect(next).not.toHaveBeenCalled();
    }));
    it("should throw an error if user does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidStaffId = "999";
        ctx = {
            request: {
                header: {
                    id: invalidStaffId,
                },
            },
            query: {
                reportingManager: String(middlewareMockData_1.middlewareMockData.Sales_Manager.staffId),
                dept: helpers_1.Dept.SALES,
            },
        };
        employeeServiceMock.getEmployee.mockResolvedValue(null);
        yield checkSameTeamMiddleware(ctx, next);
        expect(UtilsController_1.default.throwAPIError).toHaveBeenCalledWith(ctx, helpers_1.errMsg.USER_DOES_NOT_EXIST);
        expect(next).not.toHaveBeenCalled();
    }));
    it("should throw an error if an ordinary engineer attempts to fetch sales department schedule", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx = {
            request: {
                header: {
                    id: String(middlewareMockData_1.middlewareMockData.Engineering.staffId),
                },
            },
            query: {
                reportingManager: String(middlewareMockData_1.middlewareMockData.Sales_Manager.staffId),
                dept: helpers_1.Dept.SALES,
            },
        };
        employeeServiceMock.getEmployee.mockResolvedValue(middlewareMockData_1.middlewareMockData.Engineering);
        yield checkSameTeamMiddleware(ctx, next);
        expect(UtilsController_1.default.throwAPIError).toHaveBeenCalledWith(ctx, helpers_1.errMsg.DIFFERENT_DEPARTMENT);
        expect(next).not.toHaveBeenCalled();
    }));
    it("should throw an error if an ordinary and different sale team user attempts to fetch other sales team's schedule", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx = {
            request: {
                header: {
                    id: String(middlewareMockData_1.middlewareMockData.Sales_Different_Team.staffId),
                },
            },
            query: {
                reportingManager: String(middlewareMockData_1.middlewareMockData.Sales_Manager.staffId),
                dept: helpers_1.Dept.SALES,
            },
        };
        employeeServiceMock.getEmployee.mockResolvedValue(middlewareMockData_1.middlewareMockData.Sales_Different_Team);
        yield checkSameTeamMiddleware(ctx, next);
        expect(UtilsController_1.default.throwAPIError).toHaveBeenCalledWith(ctx, helpers_1.errMsg.DIFFERENT_TEAM);
        expect(next).not.toHaveBeenCalled();
    }));
    it("should be able to view team schedule if user is from the same team", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx = {
            request: {
                header: {
                    id: String(middlewareMockData_1.middlewareMockData.Sales_Same_Team.staffId),
                },
            },
            query: {
                reportingManager: String(middlewareMockData_1.middlewareMockData.Sales_Manager.staffId),
                dept: helpers_1.Dept.SALES,
            },
        };
        employeeServiceMock.getEmployee.mockResolvedValue(middlewareMockData_1.middlewareMockData.Sales_Same_Team);
        yield checkSameTeamMiddleware(ctx, next);
        expect(UtilsController_1.default.throwAPIError).not.toHaveBeenCalledWith(ctx, helpers_1.errMsg.DIFFERENT_DEPARTMENT);
        expect(UtilsController_1.default.throwAPIError).not.toHaveBeenCalledWith(ctx, helpers_1.errMsg.DIFFERENT_TEAM);
        expect(next).toHaveBeenCalled();
    }));
    it("should be able to view team schedule as long as the roleId is 1", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx = {
            request: {
                header: {
                    id: String(middlewareMockData_1.middlewareMockData.CEO.staffId),
                },
            },
            query: {
                reportingManager: String(middlewareMockData_1.middlewareMockData.Sales_Manager.staffId),
                dept: helpers_1.Dept.SALES,
            },
        };
        employeeServiceMock.getEmployee.mockResolvedValue(middlewareMockData_1.middlewareMockData.CEO);
        yield checkSameTeamMiddleware(ctx, next);
        expect(UtilsController_1.default.throwAPIError).not.toHaveBeenCalledWith(ctx, helpers_1.errMsg.DIFFERENT_DEPARTMENT);
        expect(UtilsController_1.default.throwAPIError).not.toHaveBeenCalledWith(ctx, helpers_1.errMsg.DIFFERENT_TEAM);
        expect(next).toHaveBeenCalled();
    }));
});
