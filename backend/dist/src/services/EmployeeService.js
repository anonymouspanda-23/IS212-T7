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
const bcrypt_1 = __importDefault(require("bcrypt"));
class EmployeeService {
    constructor(employeeDb) {
        this.employeeDb = employeeDb;
    }
    getEmployee(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield this.employeeDb.getEmployee(staffId);
            return employee;
        });
    }
    getEmployeeByEmail(staffEmail, inputPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.employeeDb.getEmployeeByEmail(staffEmail);
            if (!result) {
                return helpers_1.errMsg.USER_DOES_NOT_EXIST;
            }
            const { hashedPassword } = result;
            const isAuthenticated = yield bcrypt_1.default.compare(inputPassword, hashedPassword);
            if (!isAuthenticated) {
                return helpers_1.errMsg.WRONG_PASSWORD;
            }
            return yield this.employeeDb.getEmployeeByEmail(staffEmail);
        });
    }
    getDeptByManager(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.employeeDb.getDeptByManager(staffId);
        });
    }
    getAllDeptTeamCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.employeeDb.getAllDeptTeamCount();
        });
    }
    getRoleOneOrThreeEmployees(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield this.getEmployee(staffId);
            return yield this.employeeDb.getRoleOneOrThreeEmployees(staffId, employee.role);
        });
    }
}
exports.default = EmployeeService;
