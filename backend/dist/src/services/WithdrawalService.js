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
const date_1 = require("@/helpers/date");
const dayjs_1 = __importDefault(require("dayjs"));
class WithdrawalService {
    constructor(logService, withdrawalDb, requestService, reassignmentService, employeeService, notificationService) {
        this.logService = logService;
        this.withdrawalDb = withdrawalDb;
        this.requestService = requestService;
        this.reassignmentService = reassignmentService;
        this.employeeService = employeeService;
        this.notificationService = notificationService;
    }
    getWithdrawalRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield this.withdrawalDb.getWithdrawalRequest(Number(requestId));
            if (!request || request.length < 1) {
                return null;
            }
            return request;
        });
    }
    withdrawRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield this.requestService.getApprovedRequestByRequestId(Number(requestId));
            if (!request) {
                return null;
            }
            const withdrawals = yield this.getWithdrawalRequest(Number(requestId));
            if (withdrawals) {
                const hasNoApprovedOrPending = withdrawals.every((obj) => obj.status !== "APPROVED" && obj.status !== "PENDING");
                if (!hasNoApprovedOrPending) {
                    return null;
                }
            }
            const { staffId, staffName, reportingManager, managerName, dept, position, requestedDate, requestType, } = request;
            if ((0, date_1.checkPastWithdrawalDate)(requestedDate) &&
                !(0, date_1.checkValidWithdrawalDate)(requestedDate)) {
                return null;
            }
            const document = {
                requestId: requestId,
                staffId: staffId,
                staffName: staffName,
                reportingManager,
                managerName,
                dept,
                position,
                requestedDate,
                requestType,
            };
            const result = yield this.withdrawalDb.withdrawRequest(document);
            if (!result) {
                return null;
            }
            // Update original request initiatedWithdrawal boolean to true
            yield this.requestService.updateRequestinitiatedWithdrawalValue(requestId);
            const employee = yield this.employeeService.getEmployee(Number(staffId));
            const manager = yield this.employeeService.getEmployee(Number(reportingManager));
            const dayjsDate = (0, dayjs_1.default)(requestedDate);
            const formattedDate = dayjsDate.format("YYYY-MM-DD");
            const reqDate = [
                [String(formattedDate), String(request.requestType)],
            ];
            if (employee && manager) {
                let emailSubject = `[${helpers_1.Request.WITHDRAWAL}] Pending Withdrawal Request`;
                let emailContent = `Your withdrawal request has been sent to ${manager.staffFName} ${manager.staffLName}, ${manager.email} (${manager.dept} - ${manager.position}).`;
                yield this.notificationService.notify(employee.email, emailSubject, emailContent, null, reqDate);
                emailSubject = `[${helpers_1.Request.WITHDRAWAL}] Pending Withdrawal Request`;
                emailContent = `You have a pending withdrawal request from ${employee.staffFName} ${employee.staffLName}, ${employee.email} (${employee.dept} - ${employee.position}).<br><br>Please login to the portal to approve the request.`;
                yield this.notificationService.notify(manager.email, emailSubject, emailContent, null, reqDate);
            }
            yield this.logService.logRequestHelper({
                performedBy: staffId,
                requestType: helpers_1.Request.WITHDRAWAL,
                action: helpers_1.Action.APPLY,
                dept: dept,
                position: position,
                requestId: requestId,
                staffName: staffName,
                reportingManagerId: reportingManager,
                managerName: managerName,
            });
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    getSubordinatesWithdrawalRequests(staffId_1) {
        return __awaiter(this, arguments, void 0, function* (staffId, shouldLog = true) {
            const subordinatesRequests = yield this.withdrawalDb.getSubordinatesWithdrawalRequests(Number(staffId));
            const activeReassignment = yield this.reassignmentService.getActiveReassignmentAsTempManager(staffId);
            let combinedRequests = subordinatesRequests;
            if (activeReassignment && activeReassignment.active) {
                const tempSubordinatesRequests = yield this.getSubordinatesWithdrawalRequests(Number(activeReassignment.staffId), false);
                combinedRequests = [
                    ...subordinatesRequests,
                    ...tempSubordinatesRequests,
                ];
            }
            if (shouldLog && combinedRequests.length > 0) {
                const managerDetails = yield this.employeeService.getEmployee(staffId);
                if (managerDetails) {
                    yield this.logService.logRequestHelper({
                        performedBy: staffId,
                        requestType: helpers_1.Request.WITHDRAWAL,
                        action: helpers_1.Action.RETRIEVE,
                        staffName: `${managerDetails.staffFName} ${managerDetails.staffLName}`,
                        dept: managerDetails.dept,
                        position: managerDetails.position,
                    });
                }
            }
            return combinedRequests;
        });
    }
    getOwnWithdrawalRequests(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ownRequests = yield this.withdrawalDb.getOwnWithdrawalRequests(staffId);
            if (ownRequests && ownRequests.length > 0) {
                yield this.logService.logRequestHelper({
                    performedBy: staffId,
                    requestType: helpers_1.Request.WITHDRAWAL,
                    action: helpers_1.Action.RETRIEVE,
                    staffName: ownRequests[0].staffName,
                    dept: ownRequests[0].dept,
                    position: ownRequests[0].position,
                    reportingManagerId: ownRequests[0].reportingManager,
                    managerName: ownRequests[0].managerName,
                });
            }
            return ownRequests;
        });
    }
    getWithdrawalRequestById(withdrawalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield this.withdrawalDb.getWithdrawalRequestById(Number(withdrawalId));
            if (!request) {
                return null;
            }
            return request;
        });
    }
    approveWithdrawalRequest(performedBy, withdrawalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield this.getWithdrawalRequestById(withdrawalId);
            if (!request || request.status !== helpers_1.Status.PENDING) {
                return null;
            }
            if (performedBy !== request.reportingManager) {
                const activeReassignment = yield this.reassignmentService.getReassignmentActive(request.reportingManager, performedBy);
                if (!activeReassignment) {
                    return null;
                }
            }
            const withdrawalApproval = yield this.withdrawalDb.approveWithdrawalRequest(withdrawalId);
            if (!withdrawalApproval) {
                return null;
            }
            const result = yield this.requestService.setWithdrawnStatus(request.requestId);
            if (!result) {
                return null;
            }
            const managerDetails = yield this.employeeService.getEmployee(performedBy);
            const employee = yield this.employeeService.getEmployee(request.staffId);
            if (managerDetails && employee) {
                const emailSubject = `[${helpers_1.Request.WITHDRAWAL}] Withdrawal Approved`;
                const emailContent = `Your withdrawal request has been approved by ${managerDetails.staffFName} ${managerDetails.staffLName}, ${managerDetails.email} (${managerDetails.dept} - ${managerDetails.position}).<br><br>Please login to the portal to view the request.`;
                const dayjsDate = (0, dayjs_1.default)(request.requestedDate);
                const formattedDate = dayjsDate.format("YYYY-MM-DD");
                const requestedDate = [
                    [String(formattedDate), String(request.requestType)],
                ];
                yield this.notificationService.notify(employee.email, emailSubject, emailContent, null, requestedDate);
                yield this.logService.logRequestHelper({
                    performedBy: performedBy,
                    requestType: helpers_1.Request.WITHDRAWAL,
                    action: helpers_1.Action.APPROVE,
                    staffName: `${managerDetails.staffFName} ${managerDetails.staffLName}`,
                    dept: managerDetails.dept,
                    position: managerDetails.position,
                    requestId: withdrawalId,
                });
            }
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    rejectWithdrawalRequest(performedBy, withdrawalId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield this.getWithdrawalRequestById(withdrawalId);
            if (!request || request.status !== helpers_1.Status.PENDING) {
                return null;
            }
            if (performedBy !== request.reportingManager) {
                const activeReassignment = yield this.reassignmentService.getReassignmentActive(request.reportingManager, performedBy);
                if (!activeReassignment) {
                    return null;
                }
            }
            const result = yield this.withdrawalDb.rejectWithdrawalRequest(withdrawalId, reason);
            if (!result) {
                return null;
            }
            const managerDetails = yield this.employeeService.getEmployee(performedBy);
            const employee = yield this.employeeService.getEmployee(request.staffId);
            if (managerDetails && employee) {
                const emailSubject = `[${helpers_1.Request.WITHDRAWAL}] Withdrawal Rejected`;
                const emailContent = `Your withdrawal request has been rejected by ${managerDetails.staffFName} ${managerDetails.staffLName}, ${managerDetails.email} (${managerDetails.dept} - ${managerDetails.position}).<br><br>Reason: ${reason}<br><br>Please login to the portal to view the request.`;
                const dayjsDate = (0, dayjs_1.default)(request.requestedDate);
                const formattedDate = dayjsDate.format("YYYY-MM-DD");
                const requestedDate = [
                    [String(formattedDate), String(request.requestType)],
                ];
                yield this.notificationService.notify(employee.email, emailSubject, emailContent, null, requestedDate);
                yield this.logService.logRequestHelper({
                    performedBy: performedBy,
                    requestType: helpers_1.Request.WITHDRAWAL,
                    action: helpers_1.Action.REJECT,
                    staffName: `${managerDetails.staffFName} ${managerDetails.staffLName}`,
                    dept: managerDetails.dept,
                    position: managerDetails.position,
                    reason: reason,
                    requestId: withdrawalId,
                });
            }
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    updateWithdrawalStatusToExpired() {
        return __awaiter(this, void 0, void 0, function* () {
            const withdrawalRequests = yield this.withdrawalDb.updateWithdrawalStatusToExpired();
            if (withdrawalRequests && withdrawalRequests.length > 0) {
                const { requestId, requestedDate, requestType, staffId } = withdrawalRequests[0];
                const employee = yield this.employeeService.getEmployee(staffId);
                const emailSubject = `[${helpers_1.Request.WITHDRAWAL}] Withdrawal Expired`;
                const emailContent = `Your request withdrawal has expired. Please contact your reporting manager for more details.`;
                const dayjsDate = (0, dayjs_1.default)(requestedDate);
                const formattedDate = dayjsDate.format("YYYY-MM-DD");
                yield this.notificationService.notify(employee.email, emailSubject, emailContent, null, [[formattedDate, requestType]]);
                /**
                 * Logging
                 */
                yield this.logService.logRequestHelper({
                    performedBy: helpers_1.PerformedBy.SYSTEM,
                    requestId: requestId,
                    requestType: helpers_1.Request.WITHDRAWAL,
                    action: helpers_1.Action.EXPIRE,
                    dept: helpers_1.PerformedBy.PERFORMED_BY_SYSTEM,
                    position: helpers_1.PerformedBy.PERFORMED_BY_SYSTEM,
                });
            }
        });
    }
}
exports.default = WithdrawalService;
