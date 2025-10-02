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
const helpers_1 = require("@/helpers");
const schema_1 = require("@/schema");
class EmployeeController {
    constructor(employeeService) {
        this.employeeService = employeeService;
    }
    getEmployee(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { staffId } = ctx.query;
            if (!staffId) {
                ctx.status = 400;
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
            }
            const result = yield this.employeeService.getEmployee(Number(staffId));
            if (result === null) {
                ctx.status = 404;
                ctx.body = {
                    "error": helpers_1.errMsg.USER_DOES_NOT_EXIST
                };
                return;
            }
            ctx.body = result;
        });
    }
    getEmployeeByEmail(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { staffEmail, staffPassword } = ctx.request.body;
            if (!staffEmail || !staffPassword) {
                ctx.status = 400;
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_PARAMETERS);
            }
            const result = yield this.employeeService.getEmployeeByEmail(String(staffEmail), String(staffPassword));
            if (result == helpers_1.errMsg.USER_DOES_NOT_EXIST) {
                ctx.status = 404;
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.USER_DOES_NOT_EXIST);
            }
            if (result == helpers_1.errMsg.WRONG_PASSWORD) {
                ctx.status = 401;
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.WRONG_PASSWORD);
            }
            const { staffId, staffFName, staffLName, dept, position, email, reportingManager, reportingManagerName, role, } = result;
            const name = `${staffFName} ${staffLName}`;
            ctx.body = {
                staffId,
                name,
                dept,
                position,
                email,
                reportingManager,
                reportingManagerName,
                role,
            };
        });
    }
    getDeptByManager(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { staffId } = ctx.query;
            const validation = schema_1.numberSchema.safeParse(staffId);
            if (!validation.success) {
                ctx.status = 400;
                ctx.body = {
                    errMsg: validation.error.format(),
                };
                return;
            }
            let result = null;
            try {
                result = yield this.employeeService.getDeptByManager(Number(staffId));
            }
            catch (e) {
                if (e instanceof Error) {
                    ctx.body = {
                        error: e.message,
                    };
                }
                else {
                    ctx.body = {
                        error: "An unknown error occurred",
                    };
                }
                return;
            }
            ctx.body = result;
        });
    }
    getRoleOneOrThreeEmployees(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = ctx.request.header;
            if (!id) {
                ctx.status = 400;
                return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_HEADER);
            }
            const employees = yield this.employeeService.getRoleOneOrThreeEmployees(Number(id));
            ctx.body = employees;
        });
    }
}
exports.default = EmployeeController;
