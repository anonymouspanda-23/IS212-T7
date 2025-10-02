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
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("@/helpers");
class LogService {
    constructor(logDb, employeeService, reassignmentDb) {
        this.logDb = logDb;
        this.employeeService = employeeService;
        this.reassignmentDb = reassignmentDb;
    }
    logRequestHelper(options) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Logging
             */
            const { performedBy, requestType, action, dept = null, position = null, requestId = null, reason = null, staffName = null, reportingManagerId = null, managerName = null, } = options;
            const actionTaken = {
                performedBy,
                requestType,
                action,
                dept,
                position,
                requestId,
                reason,
                staffName,
                reportingManagerId,
                managerName,
            };
            yield this.logActions(actionTaken);
        });
    }
    logActions(logAction) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = Object.assign({}, logAction);
            yield this.logDb.logAction(log);
        });
    }
    getAllLogs(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { role, dept, position } = yield this.employeeService.getEmployee(staffId);
            const isRoleOne = role === helpers_1.Role.HR;
            const isRoleTwo = role === helpers_1.Role.Staff;
            const isRoleThree = role === helpers_1.Role.Manager;
            const allLogs = yield this.logDb.getLogs();
            const personalLogs = yield this.logDb.getOwnLogs(staffId);
            if (isRoleOne) {
                return allLogs;
            }
            if (isRoleThree) {
                const subordinateLogs = yield this.logDb.getSubordinateLogs(staffId);
                const activeReassignment = yield this.reassignmentDb.getActiveReassignmentAsTempManager(staffId);
                const logs = [...personalLogs, ...subordinateLogs];
                if (!!activeReassignment) {
                    const originalManagerId = activeReassignment.staffId;
                    const originalManagerSubordinates = yield this.logDb.getSubordinateLogs(originalManagerId);
                    logs.push(...originalManagerSubordinates);
                }
                const personalAndTeamLogs = {
                    [dept]: {
                        [position]: logs,
                    },
                };
                return personalAndTeamLogs;
            }
            if (isRoleTwo) {
                const ownLogs = {
                    [dept]: {
                        [position]: personalLogs,
                    },
                };
                return ownLogs;
            }
            return null;
        });
    }
}
exports.default = LogService;
