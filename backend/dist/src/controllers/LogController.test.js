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
const LogDb_1 = __importDefault(require("@/database/LogDb"));
const ReassignmentDb_1 = __importDefault(require("@/database/ReassignmentDb"));
const helpers_1 = require("@/helpers");
const EmployeeService_1 = __importDefault(require("@/services/EmployeeService"));
const LogService_1 = __importDefault(require("@/services/LogService"));
const LogController_1 = __importDefault(require("./LogController"));
const UtilsController_1 = __importDefault(require("./UtilsController"));
jest.mock("@/services/LogService");
jest.mock("./UtilsController");
describe("LogController", () => {
    let logService;
    let logController;
    let ctx;
    const employeeDb = new EmployeeDb_1.default();
    const employeeService = new EmployeeService_1.default(employeeDb);
    const logDb = new LogDb_1.default();
    const reassignmentDb = new ReassignmentDb_1.default();
    beforeEach(() => {
        logService = new LogService_1.default(logDb, employeeService, reassignmentDb);
        logController = new LogController_1.default(logService);
        ctx = {
            request: {
                header: {},
            },
            body: {},
        };
    });
    it("should throw an error if id is missing in headers", () => __awaiter(void 0, void 0, void 0, function* () {
        yield logController.getAllLogs(ctx);
        expect(UtilsController_1.default.throwAPIError).toHaveBeenCalledWith(ctx, helpers_1.errMsg.MISSING_HEADER);
    }));
    it("should return logs if found", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockLogs = [
            { id: 1, message: "Log entry 1" },
            { id: 2, message: "Log entry 2" },
        ];
        ctx.request.header.id = "123";
        logService.getAllLogs = jest.fn().mockResolvedValue(mockLogs);
        yield logController.getAllLogs(ctx);
        expect(ctx.body).toEqual(mockLogs);
        expect(logService.getAllLogs).toHaveBeenCalledWith(123);
    }));
    it("should return an error message if logs not found", () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.header.id = "123";
        logService.getAllLogs = jest.fn().mockResolvedValue(null);
        yield logController.getAllLogs(ctx);
        expect(ctx.body).toEqual({ errMsg: helpers_1.errMsg.LOGS_NOT_FOUND });
        expect(logService.getAllLogs).toHaveBeenCalledWith(123);
    }));
});
