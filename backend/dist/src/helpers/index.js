"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successMsg = exports.noteMsg = exports.errMsg = exports.Status = exports.Role = exports.RequestType = exports.Request = exports.PerformedBy = exports.PERMISSIONS = exports.HttpStatusResponse = exports.EmailHeaders = exports.Dept = exports.Action = exports.AccessControl = void 0;
var HttpStatusResponse;
(function (HttpStatusResponse) {
    HttpStatusResponse["OK"] = "OK";
    HttpStatusResponse["NOT_MODIFIED"] = "NOT_MODIFIED";
    HttpStatusResponse["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(HttpStatusResponse || (exports.HttpStatusResponse = HttpStatusResponse = {}));
var Role;
(function (Role) {
    Role[Role["HR"] = 1] = "HR";
    Role[Role["Staff"] = 2] = "Staff";
    Role[Role["Manager"] = 3] = "Manager";
})(Role || (exports.Role = Role = {}));
var errMsg;
(function (errMsg) {
    errMsg["MISSING_HEADER"] = "Missing header";
    errMsg["MISSING_PARAMETERS"] = "Missing parameters";
    errMsg["WRONG_PASSWORD"] = "User has entered the wrong password.";
    errMsg["UNAUTHORISED"] = "User is not authorised to perform this role.";
    errMsg["USER_DOES_NOT_EXIST"] = "User does not exist.";
    errMsg["REQUESTS_NOT_FOUND"] = "No requests found";
    errMsg["SAME_DAY_REQUEST"] = "Existing request for selected day found.";
    errMsg["PAST_DATE"] = "Selected date must be at least 24 hours ahead";
    errMsg["WEEKEND_REQUEST"] = "Applying WFH for the weekends is not allowed.";
    errMsg["PAST_DEADLINE"] = "The application deadline for the selected day has passed.";
    errMsg["DUPLICATE_DATE"] = "The same date has already been applied in this request";
    errMsg["INSERT_ERROR"] = "Database insertion error.";
    errMsg["DIFFERENT_DEPARTMENT"] = "User is from a different department and has no additional privilege to view data.";
    errMsg["DIFFERENT_TEAM"] = "User is from a different team and has no additional privilege to view data.";
    errMsg["PAST_DATE_NOT_ALLOWED"] = "Don't go back to the past. Move on.";
    errMsg["CURRENT_DATE_NOT_ALLOWED"] = "Tomorrow onwards only.";
    errMsg["NON_REJECTED_REASSIGNMENT"] = "User currently has a pending/active reassignment with the same temporary manager between the same date range.";
    errMsg["SAME_ROLE_REASSIGNMENT"] = "You can only assign to another manager with the same role";
    errMsg["ACTIVE_REASSIGNMENT"] = "User currently has an active reassignment. This request is no longer valid.";
    errMsg["INVALID_ACTION"] = "Invalid action. Must be 'APPROVE' or 'REJECT'.";
    errMsg["NO_ACTIVE_REASSIGNMENT"] = "No active reassignment found for the staff member as temp manager";
    errMsg["GENERIC_ERROR"] = "An error has occurred.";
    errMsg["LOGS_NOT_FOUND"] = "No logs found";
    errMsg["FAILED_TO_SEND_EMAIL"] = "Failed to send email";
})(errMsg || (exports.errMsg = errMsg = {}));
const noteMsg = "Note: More than 2 requests have already been made for the selected week.";
exports.noteMsg = noteMsg;
const successMsg = "Selected dates submitted successfully.";
exports.successMsg = successMsg;
var AccessControl;
(function (AccessControl) {
    AccessControl["VIEW_OWN_SCHEDULE"] = "VIEW_OWN_SCHEDULE";
    AccessControl["VIEW_OVERALL_SCHEDULE"] = "VIEW_OVERALL_SCHEDULE";
    AccessControl["VIEW_PENDING_REQUEST"] = "VIEW_PENDING_REQUEST";
    AccessControl["VIEW_SUB_WITHDRAWAL_REQUEST"] = "VIEW_SUB_WITHDRAWAL_REQUEST";
})(AccessControl || (exports.AccessControl = AccessControl = {}));
// TODO: Add more permission
const PERMISSIONS = {
    1: [
        AccessControl.VIEW_OWN_SCHEDULE,
        AccessControl.VIEW_OVERALL_SCHEDULE,
        AccessControl.VIEW_PENDING_REQUEST,
        AccessControl.VIEW_SUB_WITHDRAWAL_REQUEST,
    ],
    2: [AccessControl.VIEW_OWN_SCHEDULE],
    3: [
        AccessControl.VIEW_OWN_SCHEDULE,
        AccessControl.VIEW_OVERALL_SCHEDULE,
        AccessControl.VIEW_PENDING_REQUEST,
        AccessControl.VIEW_SUB_WITHDRAWAL_REQUEST,
    ],
};
exports.PERMISSIONS = PERMISSIONS;
var RequestType;
(function (RequestType) {
    RequestType["AM"] = "AM";
    RequestType["PM"] = "PM";
    RequestType["FULL"] = "FULL";
})(RequestType || (exports.RequestType = RequestType = {}));
var Status;
(function (Status) {
    Status["PENDING"] = "PENDING";
    Status["APPROVED"] = "APPROVED";
    Status["REJECTED"] = "REJECTED";
    Status["CANCELLED"] = "CANCELLED";
    Status["WITHDRAWN"] = "WITHDRAWN";
    Status["EXPIRED"] = "EXPIRED";
    Status["REVOKED"] = "REVOKED";
})(Status || (exports.Status = Status = {}));
var Dept;
(function (Dept) {
    Dept["CEO"] = "CEO";
    Dept["CONSULTANCY"] = "Consultancy";
    Dept["ENGINEERING"] = "Engineering";
    Dept["FINANCE"] = "Finance";
    Dept["HR"] = "HR";
    Dept["IT"] = "IT";
    Dept["SALES"] = "Sales";
    Dept["SOLUTIONING"] = "Solutioning";
})(Dept || (exports.Dept = Dept = {}));
var Request;
(function (Request) {
    Request["APPLICATION"] = "APPLICATION";
    Request["WITHDRAWAL"] = "WITHDRAWAL";
    Request["REASSIGNMENT"] = "REASSIGNMENT";
})(Request || (exports.Request = Request = {}));
var Action;
(function (Action) {
    Action["APPLY"] = "APPLY";
    Action["RETRIEVE"] = "RETRIEVE";
    Action["APPROVE"] = "APPROVE";
    Action["REJECT"] = "REJECT";
    Action["CANCEL"] = "CANCEL";
    Action["REVOKE"] = "REVOKE";
    Action["REASSIGN"] = "REASSIGN";
    Action["EXPIRE"] = "EXPIRE";
    Action["SET_ACTIVE"] = "SET_ACTIVE";
    Action["SET_INACTIVE"] = "SET_INACTIVE";
})(Action || (exports.Action = Action = {}));
var PerformedBy;
(function (PerformedBy) {
    PerformedBy[PerformedBy["SYSTEM"] = 0] = "SYSTEM";
    PerformedBy["PERFORMED_BY_SYSTEM"] = "Performed By System";
})(PerformedBy || (exports.PerformedBy = PerformedBy = {}));
var EmailHeaders;
(function (EmailHeaders) {
    EmailHeaders["REQUEST_SENT"] = "[Application] WFH Request Sent";
    EmailHeaders["REASSIGNMENT_SENT"] = "[Reassignment] Reassignment Request Sent";
    EmailHeaders["WITHDRAWAL_SENT"] = "[Withdrawal] Withdrawal Request Sent";
    EmailHeaders["REQUEST_CANCELLED"] = "[Application] WFH Request Cancelled";
})(EmailHeaders || (exports.EmailHeaders = EmailHeaders = {}));
