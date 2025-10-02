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
exports.checkUserRolePermission = void 0;
const UtilsController_1 = __importDefault(require("@/controllers/UtilsController"));
const EmployeeDb_1 = __importDefault(require("@/database/EmployeeDb"));
const helpers_1 = require("@/helpers");
const schema_1 = require("@/schema");
const EmployeeService_1 = __importDefault(require("@/services/EmployeeService"));
const employeeDb = new EmployeeDb_1.default();
const employeeService = new EmployeeService_1.default(employeeDb);
const checkUserRolePermission = (action) => {
    return (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = ctx.request.header;
        if (!id) {
            return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.MISSING_HEADER);
        }
        const sanitisedStaffId = schema_1.numberSchema.parse(id);
        const employee = yield employeeService.getEmployee(sanitisedStaffId);
        if (!employee) {
            return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.USER_DOES_NOT_EXIST);
        }
        if (!helpers_1.PERMISSIONS[employee.role].includes(action)) {
            return UtilsController_1.default.throwAPIError(ctx, helpers_1.errMsg.UNAUTHORISED);
        }
        yield next();
    });
};
exports.checkUserRolePermission = checkUserRolePermission;
