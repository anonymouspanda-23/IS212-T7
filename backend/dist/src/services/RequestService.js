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
const helpers_2 = require("@/helpers/");
const date_1 = require("@/helpers/date");
const dayjs_1 = __importDefault(require("dayjs"));
class RequestService {
    constructor(logService, employeeService, notificationService, requestDb, reassignmentService) {
        this.logService = logService;
        this.employeeService = employeeService;
        this.notificationService = notificationService;
        this.requestDb = requestDb;
        this.reassignmentService = reassignmentService;
    }
    updateRequestinitiatedWithdrawalValue(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.requestDb.updateRequestinitiatedWithdrawalValue(requestId);
        });
    }
    getMySchedule(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield this.employeeService.getEmployee(myId);
            if (!employee) {
                return helpers_1.errMsg.USER_DOES_NOT_EXIST;
            }
            const schedule = yield this.requestDb.getMySchedule(myId);
            if (schedule.length < 1) {
                return helpers_1.errMsg.REQUESTS_NOT_FOUND;
            }
            return schedule;
        });
    }
    cancelPendingRequests(staffId, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.requestDb.cancelPendingRequests(staffId, requestId);
            if (!result) {
                return null;
            }
            const { staffFName, staffLName, reportingManager, reportingManagerName, dept, email, position, } = yield this.employeeService.getEmployee(staffId);
            const dayjsDate = (0, dayjs_1.default)(result[0].requestedDate);
            const formattedDate = dayjsDate.format("YYYY-MM-DD");
            const requestedDate = [
                [formattedDate, result[0].requestType],
            ];
            const manager = yield this.employeeService.getEmployee(Number(reportingManager));
            if (manager) {
                let emailSubject = `[${helpers_1.Request.APPLICATION}] Pending Application Cancelled`;
                let emailContent = `${staffFName} ${staffLName}, ${email} (${dept} - ${position}) has cancelled pending application.<br><br>Please login to the portal to view updated request list.`;
                yield this.notificationService.notify(manager.email, emailSubject, emailContent, null, requestedDate);
                emailSubject = `[${helpers_1.Request.APPLICATION}] Pending Application Cancelled`;
                emailContent = `Your application cancellation has been sent to ${manager.staffFName} ${manager.staffLName}, ${manager.email} (${manager.dept} - ${manager.position}).`;
                yield this.notificationService.notify(email, emailSubject, emailContent, null, requestedDate);
            }
            /**
             * Logging
             */
            yield this.logService.logRequestHelper({
                performedBy: staffId,
                requestType: helpers_1.Request.APPLICATION,
                action: helpers_1.Action.CANCEL,
                dept: dept,
                position: position,
                requestId: requestId,
                staffName: `${staffFName} ${staffLName}`,
                reportingManagerId: reportingManager,
                managerName: reportingManagerName,
            });
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    getAllSubordinatesRequests(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const surbodinatesRequests = yield this.requestDb.getAllSubordinatesRequests(staffId);
            return surbodinatesRequests;
        });
    }
    getOwnPendingRequests(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingRequests = yield this.requestDb.getOwnPendingRequests(myId);
            if (pendingRequests && pendingRequests.length > 0) {
                /**
                 * Logging
                 */
                yield this.logService.logRequestHelper({
                    performedBy: myId,
                    requestType: helpers_1.Request.APPLICATION,
                    action: helpers_1.Action.RETRIEVE,
                    staffName: pendingRequests[0].staffName,
                    dept: pendingRequests[0].dept,
                    position: pendingRequests[0].position,
                    reportingManagerId: pendingRequests[0].reportingManager,
                    managerName: pendingRequests[0].managerName,
                });
            }
            return pendingRequests;
        });
    }
    getSchedule(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield this.employeeService.getEmployee(staffId);
            if (!employee) {
                return helpers_1.errMsg.USER_DOES_NOT_EXIST;
            }
            const { role, position, reportingManager, dept, staffFName, staffLName, reportingManagerName, } = employee;
            const allDeptTeamCount = yield this.employeeService.getAllDeptTeamCount();
            const isManagerOrHR = role === helpers_2.Role.HR || role === helpers_2.Role.Manager;
            const wfhStaff = isManagerOrHR
                ? yield this.requestDb.getAllDeptSchedule()
                : yield this.requestDb.getTeamSchedule(reportingManager, position);
            // Check for any temp dept/teams
            const activeReassignment = yield this.reassignmentService.getActiveReassignmentAsTempManager(staffId);
            let schedule = {};
            if (isManagerOrHR) {
                schedule = Object.assign({}, allDeptTeamCount);
                for (const dept of Object.keys(allDeptTeamCount)) {
                    if (activeReassignment &&
                        activeReassignment.active &&
                        activeReassignment.originalManagerDept === dept) {
                        allDeptTeamCount[dept].wfhStaff = wfhStaff[dept] || [];
                        allDeptTeamCount[dept].isTempTeam = true;
                    }
                    else {
                        allDeptTeamCount[dept].wfhStaff = wfhStaff[dept] || [];
                    }
                }
                /**
                 * Logging
                 */
                yield this.logService.logRequestHelper({
                    performedBy: staffId,
                    requestType: helpers_1.Request.APPLICATION,
                    action: helpers_1.Action.RETRIEVE,
                    staffName: `${staffFName} ${staffLName}`,
                    reportingManagerId: reportingManager,
                    dept: dept,
                    position: position,
                });
            }
            else {
                schedule = {
                    [dept]: {
                        teams: {
                            [position]: allDeptTeamCount[dept].teams[position],
                        },
                    },
                };
                schedule[dept].wfhStaff = wfhStaff;
                /**
                 * Logging
                 */
                yield this.logService.logRequestHelper({
                    performedBy: staffId,
                    requestType: helpers_1.Request.APPLICATION,
                    action: helpers_1.Action.RETRIEVE,
                    staffName: `${staffFName} ${staffLName}`,
                    reportingManagerId: reportingManager,
                    managerName: reportingManagerName,
                    dept: dept,
                    position: position,
                });
            }
            return schedule;
        });
    }
    getPendingOrApprovedRequests(myId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requests = yield this.requestDb.getPendingOrApprovedRequests(myId);
            return requests;
        });
    }
    postRequest(requestDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            let responseDates = {
                successDates: [],
                noteDates: [],
                errorDates: [],
                weekendDates: [],
                pastDates: [],
                pastDeadlineDates: [],
                duplicateDates: [],
                insertErrorDates: [],
            };
            const result = yield this.getPendingOrApprovedRequests(requestDetails.staffId);
            const dateList = result.map((request) => request.requestedDate);
            const weekMapping = (0, date_1.weekMap)(dateList);
            const seenDates = new Set();
            for (const dateType of requestDetails.requestedDates) {
                const [date, type] = dateType;
                let dateInput = new Date(date);
                if (!seenDates.has(date)) {
                    seenDates.add(date);
                }
                else {
                    responseDates.duplicateDates.push(dateType);
                    continue;
                }
                if ((0, date_1.checkWeekend)(dateInput)) {
                    responseDates.weekendDates.push(dateType);
                    continue;
                }
                if ((0, date_1.checkPastDate)(dateInput)) {
                    responseDates.pastDates.push(dateType);
                    continue;
                }
                if ((0, date_1.checkLatestDate)(dateInput)) {
                    responseDates.pastDeadlineDates.push(dateType);
                    continue;
                }
                if (dateList.some((d) => d.getTime() === dateInput.getTime())) {
                    responseDates.errorDates.push(dateType);
                    continue;
                }
                let checkWeek = (0, date_1.checkDate)(dateInput, weekMapping);
                if (checkWeek) {
                    responseDates.noteDates.push(dateType);
                }
                const employee = yield this.employeeService.getEmployee(Number(requestDetails.staffId));
                const { staffFName, staffLName, reportingManager, reportingManagerName, dept, position, } = employee;
                const document = {
                    staffId: requestDetails.staffId,
                    staffName: `${staffFName} ${staffLName}`,
                    reportingManager,
                    managerName: reportingManagerName,
                    dept,
                    requestedDate: date,
                    requestType: type,
                    reason: requestDetails.reason,
                    position,
                    initiatedWithdrawal: false,
                };
                const requestInsert = yield this.requestDb.postRequest(document);
                if (requestInsert) {
                    responseDates.successDates.push(dateType);
                    const reqId = requestInsert;
                    /**
                     * Logging
                     */
                    yield this.logService.logRequestHelper({
                        performedBy: requestDetails.staffId,
                        requestType: helpers_1.Request.APPLICATION,
                        action: helpers_1.Action.APPLY,
                        dept: dept,
                        position: position,
                        requestId: reqId,
                        staffName: `${staffFName} ${staffLName}`,
                        reportingManagerId: reportingManager,
                        managerName: reportingManagerName,
                    });
                }
                else {
                    responseDates.insertErrorDates.push(dateType);
                }
            }
            if (responseDates.successDates.length == 0) {
                return responseDates;
            }
            const employee = yield this.employeeService.getEmployee(Number(requestDetails.staffId));
            if (employee) {
                yield this.notificationService.pushRequestSentNotification(helpers_1.EmailHeaders.REQUEST_SENT, employee.email, employee.reportingManager, helpers_1.Request.APPLICATION, responseDates.successDates, requestDetails.reason);
                const manager = yield this.employeeService.getEmployee(Number(employee.reportingManager));
                if (manager) {
                    const emailSubject = `[${helpers_1.Request.APPLICATION}] Pending Application Request`;
                    const emailContent = `You have a pending application request from ${employee.staffFName} ${employee.staffLName}, ${employee.email} (${employee.dept} - ${employee.position}).<br><br>Reason for application: ${requestDetails.reason}.<br><br>Please login to the portal to approve the request.`;
                    yield this.notificationService.notify(manager.email, emailSubject, emailContent, null, responseDates.successDates);
                }
            }
            return responseDates;
        });
    }
    getPendingRequestByRequestId(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestDetail = yield this.requestDb.getPendingRequestByRequestId(requestId);
            return requestDetail;
        });
    }
    getApprovedRequestByRequestId(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestDetail = yield this.requestDb.getApprovedRequestByRequestId(requestId);
            return requestDetail;
        });
    }
    approveRequest(performedBy, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let reassignment;
            const request = yield this.getPendingRequestByRequestId(requestId);
            if (!request) {
                return null;
            }
            const actionTakenBy = yield this.employeeService.getEmployee(performedBy);
            const employee = yield this.employeeService.getEmployee(request.staffId);
            if (!employee) {
                return null;
            }
            if (performedBy !== employee.reportingManager) {
                reassignment = yield this.reassignmentService.getReassignmentActive(request.reportingManager, performedBy);
                if (!reassignment) {
                    return null;
                }
            }
            const result = yield this.requestDb.approveRequest(requestId);
            if (!result) {
                return null;
            }
            const manager = yield this.employeeService.getEmployee(Number(performedBy));
            if (manager) {
                const emailSubject = `[${helpers_1.Request.APPLICATION}] Application Approved`;
                const emailContent = `Your application has been approved by ${manager.staffFName} ${manager.staffLName}, ${manager.email} (${manager.dept} - ${manager.position}).<br><br>Please login to the portal to view the request.`;
                const dayjsDate = (0, dayjs_1.default)(request.requestedDate);
                const formattedDate = dayjsDate.format("YYYY-MM-DD");
                const requestedDate = [
                    [String(formattedDate), String(request.requestType)],
                ];
                yield this.notificationService.notify(employee.email, emailSubject, emailContent, null, requestedDate);
            }
            /**
             * Logging
             */
            yield this.logService.logRequestHelper({
                performedBy: performedBy,
                requestType: helpers_1.Request.APPLICATION,
                action: helpers_1.Action.APPROVE,
                requestId: requestId,
                staffName: (_a = reassignment === null || reassignment === void 0 ? void 0 : reassignment.tempManagerName) !== null && _a !== void 0 ? _a : employee.reportingManagerName,
                dept: actionTakenBy.dept,
                position: actionTakenBy.position,
            });
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    rejectRequest(performedBy, requestId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let reassignment;
            const request = yield this.getPendingRequestByRequestId(requestId);
            if (!request) {
                return null;
            }
            const managerDetails = yield this.employeeService.getEmployee(request.reportingManager);
            const employee = yield this.employeeService.getEmployee(request.staffId);
            if (!employee) {
                return null;
            }
            if (performedBy !== employee.reportingManager) {
                reassignment = yield this.reassignmentService.getReassignmentActive(request.reportingManager, performedBy);
                if (!reassignment) {
                    return null;
                }
            }
            const result = yield this.requestDb.rejectRequest(requestId, reason);
            if (!result) {
                return null;
            }
            const manager = yield this.employeeService.getEmployee(Number(performedBy));
            if (manager) {
                const emailSubject = `[${helpers_1.Request.APPLICATION}] Application Rejected`;
                const emailContent = `Your application has been rejected by ${manager.staffFName} ${manager.staffLName}, ${manager.email} (${manager.dept} - ${manager.position}).<br><br>Reason: ${reason}<br><br>Please login to the portal to view the request.`;
                const dayjsDate = (0, dayjs_1.default)(request.requestedDate);
                const formattedDate = dayjsDate.format("YYYY-MM-DD");
                const requestedDate = [
                    [String(formattedDate), String(request.requestType)],
                ];
                yield this.notificationService.notify(employee.email, emailSubject, emailContent, null, requestedDate);
            }
            /**
             * Logging
             */
            yield this.logService.logRequestHelper({
                performedBy: performedBy,
                requestType: helpers_1.Request.APPLICATION,
                action: helpers_1.Action.REJECT,
                requestId: requestId,
                staffName: (_a = reassignment === null || reassignment === void 0 ? void 0 : reassignment.tempManagerName) !== null && _a !== void 0 ? _a : employee.reportingManagerName,
                reason: reason,
                dept: managerDetails.dept,
                position: managerDetails.position,
            });
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    updateRequestStatusToExpired() {
        return __awaiter(this, void 0, void 0, function* () {
            const requests = yield this.requestDb.updateRequestStatusToExpired();
            if (!!requests) {
                for (const request of requests) {
                    const { requestId, staffId, requestedDate, requestType } = request;
                    const employee = yield this.employeeService.getEmployee(staffId);
                    const emailSubject = `[${helpers_1.Request.APPLICATION}] Application Expired`;
                    const emailContent = `Your application has expired. Please re-apply.`;
                    const dayjsDate = (0, dayjs_1.default)(requestedDate);
                    const formattedDate = dayjsDate.format("YYYY-MM-DD");
                    yield this.notificationService.notify(employee.email, emailSubject, emailContent, null, [[formattedDate, requestType]]);
                    /**
                     * Logging
                     */
                    yield this.logService.logRequestHelper({
                        performedBy: helpers_1.PerformedBy.SYSTEM,
                        requestId: requestId,
                        requestType: helpers_1.Request.REASSIGNMENT,
                        action: helpers_1.Action.EXPIRE,
                        dept: helpers_1.PerformedBy.PERFORMED_BY_SYSTEM,
                        position: helpers_1.PerformedBy.PERFORMED_BY_SYSTEM,
                    });
                }
            }
        });
    }
    revokeRequest(performedBy, requestId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let reassignment;
            const request = yield this.getApprovedRequestByRequestId(requestId);
            if (!request) {
                return null;
            }
            let managerDetails = yield this.employeeService.getEmployee(request.reportingManager);
            if (performedBy !== request.reportingManager) {
                reassignment = yield this.reassignmentService.getReassignmentActive(request.reportingManager, performedBy);
                if (!reassignment) {
                    return null;
                }
                managerDetails = yield this.employeeService.getEmployee(performedBy);
            }
            if ((0, date_1.checkPastWithdrawalDate)(request.requestedDate) &&
                !(0, date_1.checkValidWithdrawalDate)(request.requestedDate)) {
                return null;
            }
            const result = yield this.requestDb.revokeRequest(requestId, reason);
            if (!result) {
                return null;
            }
            if (managerDetails) {
                const dayjsDate = (0, dayjs_1.default)(request.requestedDate);
                const formattedDate = dayjsDate.format("YYYY-MM-DD");
                const requestedDate = [
                    [String(formattedDate), String(request.requestType)],
                ];
                const employee = yield this.employeeService.getEmployee(request.staffId);
                if (employee) {
                    const emailSubject = `[${helpers_1.Request.APPLICATION}] Application Revoked`;
                    const emailContent = `Your application has been revoked by ${managerDetails.staffFName} ${managerDetails.staffLName}, ${managerDetails.email} (${managerDetails.dept} - ${managerDetails.position}).<br><br>Reason: ${reason}.<br><br>Please login to the portal to view the revocation.`;
                    yield this.notificationService.notify(employee.email, emailSubject, emailContent, null, requestedDate);
                }
            }
            /**
             * Logging
             */
            yield this.logService.logRequestHelper({
                performedBy: performedBy,
                requestType: helpers_1.Request.APPLICATION,
                action: helpers_1.Action.REVOKE,
                requestId: requestId,
                staffName: (_a = reassignment === null || reassignment === void 0 ? void 0 : reassignment.tempManagerName) !== null && _a !== void 0 ? _a : request.managerName,
                reason: reason,
                dept: managerDetails.dept,
                position: managerDetails.position,
            });
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    setWithdrawnStatus(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.requestDb.setWithdrawnStatus(requestId);
            if (!result) {
                return null;
            }
            return helpers_1.HttpStatusResponse.OK;
        });
    }
}
exports.default = RequestService;
