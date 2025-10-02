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
const mailer_1 = __importDefault(require("@/config/mailer"));
const EmployeeController_1 = __importDefault(require("@/controllers/EmployeeController"));
const LogController_1 = __importDefault(require("@/controllers/LogController"));
const ReassignmentController_1 = __importDefault(require("@/controllers/ReassignmentController"));
const RequestController_1 = __importDefault(require("@/controllers/RequestController"));
const WithdrawalController_1 = __importDefault(require("@/controllers/WithdrawalController"));
const EmployeeDb_1 = __importDefault(require("@/database/EmployeeDb"));
const LogDb_1 = __importDefault(require("@/database/LogDb"));
const ReassignmentDb_1 = __importDefault(require("@/database/ReassignmentDb"));
const RequestDb_1 = __importDefault(require("@/database/RequestDb"));
const WithdrawalDb_1 = __importDefault(require("@/database/WithdrawalDb"));
const helpers_1 = require("@/helpers");
const checkUserRolePermission_1 = require("@/middleware/checkUserRolePermission");
const EmployeeService_1 = __importDefault(require("@/services/EmployeeService"));
const LogService_1 = __importDefault(require("@/services/LogService"));
const NotificationService_1 = __importDefault(require("@/services/NotificationService"));
const ReassignmentService_1 = __importDefault(require("@/services/ReassignmentService"));
const RequestService_1 = __importDefault(require("@/services/RequestService"));
const WithdrawalService_1 = __importDefault(require("@/services/WithdrawalService"));
const swagger_1 = __importDefault(require("@/swagger"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa2_swagger_ui_1 = require("koa2-swagger-ui");
/**
 * Databases
 */
const requestDb = new RequestDb_1.default();
const employeeDb = new EmployeeDb_1.default();
const reassignmentDb = new ReassignmentDb_1.default();
const logDb = new LogDb_1.default();
const withdrawalDb = new WithdrawalDb_1.default();
/**
 * External Services
 */
const mailer = mailer_1.default.getInstance();
/**
 * Services
 */
const employeeService = new EmployeeService_1.default(employeeDb);
const logService = new LogService_1.default(logDb, employeeService, reassignmentDb);
const notificationService = new NotificationService_1.default(employeeService, mailer);
const reassignmentService = new ReassignmentService_1.default(reassignmentDb, requestDb, employeeService, logService, notificationService);
const requestService = new RequestService_1.default(logService, employeeService, notificationService, requestDb, reassignmentService);
const withdrawalService = new WithdrawalService_1.default(logService, withdrawalDb, requestService, reassignmentService, employeeService, notificationService);
/**
 * Controllers
 */
const requestController = new RequestController_1.default(requestService);
const employeeController = new EmployeeController_1.default(employeeService);
const reassignmentController = new ReassignmentController_1.default(reassignmentService);
const withdrawalController = new WithdrawalController_1.default(withdrawalService);
const logController = new LogController_1.default(logService);
const router = new koa_router_1.default();
router.prefix("/api/v1");
router.get("/swagger.json", (ctx) => {
    ctx.body = swagger_1.default;
});
router.get("/docs", (0, koa2_swagger_ui_1.koaSwagger)({
    swaggerOptions: {
        url: `${process.env.DOMAIN}/api/v1/swagger.json`,
    },
}));
router.get("/", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.body = `Server is Running! 💨`;
}));
/**
 * @openapi
 * /api/v1/login:
 *   post:
 *     description: Login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffEmail:
 *                 type: string
 *                 description: The email of the employee
 *               staffPassword:
 *                 type: string
 *                 description: The password of the employee
 *             required:
 *               - staffEmail
 *               - staffPassword
 *     responses:
 *       200:
 *         description: Returns an employee object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 staffId:
 *                   type: number
 *                   description: The employee's ID
 *                 role:
 *                   type: string
 *                   description: The employee's role
 *       400:
 *         description: Invalid request or missing parameters
 */
router.post("/login", (ctx) => employeeController.getEmployeeByEmail(ctx));
/**
 * @openapi
 * /api/v1/cancelPendingRequests:
 *   post:
 *     description: Cancel user's own pending requests
 *     tags: [Pending Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffId:
 *                 type: number
 *                 description: The user's own staffId
 *               requestId:
 *                 type: string
 *                 description: RequestId to be cancelled
 *             required:
 *               - staffId
 *               - requestId
 */
router.post("/cancelPendingRequests", (ctx) => requestController.cancelPendingRequests(ctx));
/**
 * @openapi
 * /api/v1/getAllSubordinatesRequests:
 *   get:
 *     description: Get pending request from direct subordinates
 *     tags: [All Subordinates Requests]
 *     parameters:
 *       - in: header
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User's staffId
 *     responses:
 *       200:
 *         description: Returns all subordinates requests from direct subordinates
 */
router.get("/getAllSubordinatesRequests", (0, checkUserRolePermission_1.checkUserRolePermission)(helpers_1.AccessControl.VIEW_PENDING_REQUEST), (ctx) => requestController.getAllSubordinatesRequests(ctx));
/**
 * @openapi
 * /api/v1/getOwnPendingRequests?myId={INSERT ID HERE}:
 *   get:
 *     description: Get own pending request
 *     tags: [Pending Requests]
 *     parameters:
 *       - in: query
 *         name: myId
 *         schema:
 *           type: number
 *         required: true
 *         description: User's staffId
 *     responses:
 *       200:
 *         description: Returns own pending requests
 */
router.get("/getOwnPendingRequests", (ctx) => requestController.getOwnPendingRequests(ctx));
/**
 * @openapi
 * /api/v1/getEmployee?staffId={INSERT ID HERE}:
 *   get:
 *     description: Get employee data
 *     tags: [Employee]
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: number
 *         required: true
 *         description: The Id of the employee to retrieve
 *     responses:
 *       200:
 *         description: Returns an employee object
 */
router.get("/getEmployee", (ctx) => employeeController.getEmployee(ctx));
/**
 * @openapi
 * /api/v1/getMySchedule?myId={INSERT ID HERE}:
 *   get:
 *     description: Get your own schedule
 *     tags: [Schedule]
 *     parameters:
 *       - in: query
 *         name: myId
 *         schema:
 *           type: number
 *         required: true
 *         description: Retrieve lists of your schedule regardless of status
 *     responses:
 *       200:
 *         description: Returns a request object
 */
router.get("/getMySchedule", (ctx) => requestController.getMySchedule(ctx));
/**
 * @openapi
 * /api/v1/getSchedule:
 *   get:
 *     description: Get schedule depending on your role
 *     tags: [Schedule]
 *     parameters:
 *       - in: header
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User's staffId
 *     responses:
 *       200:
 *         description: Returns a request object
 */
router.get("/getSchedule", (ctx) => requestController.getSchedule(ctx));
// /**
//  * @openapi
//  * /api/v1/getDeptScheduleByStaffId?staffId={INSERT STAFF ID HERE}:
//  *   get:
//  *     description: Get schedule for departments under current manager/director.
//  *     tags: [Schedule]
//  *     parameters:
//  *       - in: query
//  *         name: staffId
//  *         schema:
//  *           type: number
//  *         required: true
//  *         description: Retrieve list of departments under given staffId.
//  *     responses:
//  *       200:
//  *         description: Returns a request object
//  */
// router.get(
//   "/getDeptByManager",
//   checkUserRolePermission(AccessControl.VIEW_OVERALL_SCHEDULE),
//   (ctx) => employeeController.getDeptByManager(ctx),
// );
/**
 * @openapi
 * /api/v1/postRequest:
 *   post:
 *     description: Post Request data (Submit WFH application form)
 *     tags: [Request]
 *     parameters:
 *       - in: WFH Application Details
 *     responses:
 *       200:
 *         description: Returns an success, error, note object
 */
router.post("/postRequest", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield requestController.postRequest(ctx);
}));
/**
 * @openapi
 * /api/v1/approveRequest:
 *   post:
 *     description: approve subordinates' pending requests
 *     tags: [Pending Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               performedBy:
 *                 type: number
 *                 description: Manager's own staffId
 *               requestId:
 *                 type: string
 *                 description: RequestId to be approved
 *             required:
 *               - performedBy
 *               - requestId
 */
router.post("/approveRequest", (ctx) => requestController.approveRequest(ctx));
/**
 * @openapi
 * /api/v1/rejectRequest:
 *   post:
 *     description: reject subordinates' pending requests
 *     tags: [Pending Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               performedBy:
 *                 type: number
 *                 description: Manager's own staffId
 *               requestId:
 *                 type: string
 *                 description: RequestId to be rejected
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *             required:
 *               - performedBy
 *               - requestId
 *               - reason
 */
router.post("/rejectRequest", (ctx) => requestController.rejectRequest(ctx));
/**
 * @openapi
 * /api/v1/revokeRequest:
 *   post:
 *     description: revoke subordinates' approved requests
 *     tags: [Approved Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               performedBy:
 *                 type: number
 *                 description: Manager's own staffId
 *               requestId:
 *                 type: string
 *                 description: RequestId to be revoked
 *               reason:
 *                 type: string
 *                 description: Reason for revocation
 *             required:
 *               - performedBy
 *               - requestId
 *               - reason
 */
router.post("/revokeRequest", (ctx) => requestController.revokeRequest(ctx));
/**
 * @openapi
 * /api/v1/withdrawRequest:
 *   post:
 *     description: withdraw my own approved request
 *     tags: [Withdrawal Request]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: number
 *                 description: requestId of the request I want to withdraw
 *             required:
 *               - requestId
 */
router.post("/withdrawRequest", (ctx) => withdrawalController.withdrawRequest(ctx));
/**
 * @openapi
 * /api/v1/getRoleOneOrThreeEmployees:
 *   get:
 *     description: Get role 1 or role 3 employees
 *     tags: [Employee]
 *     responses:
 *       200:
 *         description: Returns an array of role 1 or role 3 employees object
 */
router.get("/getRoleOneOrThreeEmployees", (ctx) => employeeController.getRoleOneOrThreeEmployees(ctx));
/**
 * @openapi
 * /api/v1/requestReassignment:
 *   post:
 *     description: Initiate reassignment to another manager
 *     tags: [Reassignment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffId:
 *                 type: number
 *                 description: Your staffId
 *               startDate:
 *                 type: string
 *                 description: Your leave start date
 *               endDate:
 *                 type: string
 *                 description: Your leave end date
 *               tempReportingManagerId:
 *                 type: number
 *                 description: New manager staffId
 *             required:
 *               - staffId
 *               - startDate
 *               - endDate
 *               - tempReportingManagerId
 */
router.post("/requestReassignment", (ctx) => reassignmentController.insertReassignmentRequest(ctx));
/**
 * @openapi
 * /api/v1/getReassignmentStatus:
 *   get:
 *     description: Get all reassignment status
 *     tags: [Reassignment]
 *     parameters:
 *       - in: header
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User's staffId
 *     responses:
 *       200:
 *         description: Returns all reassignment status
 */
router.get("/getReassignmentStatus", (ctx) => reassignmentController.getReassignmentStatus(ctx));
/**
 * @openapi
 * /api/v1/getTempMgrReassignmentStatus:
 *   get:
 *     description: Get all reassignment status
 *     tags: [Reassignment]
 *     parameters:
 *       - in: header
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Temp Manager's Staff Id
 *     responses:
 *       200:
 *         description: Returns all reassignment status
 */
router.get("/getTempMgrReassignmentStatus", (ctx) => reassignmentController.getTempMgrReassignmentStatus(ctx));
/**
 * @openapi

 * /api/v1/getIncomingReassignmentRequests:
 *   get:
 *     description: Get incoming reassignment requests
 *     tags: [Reassignment]
 *     parameters:
 *       - in: header
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User's staffId
 *     responses:
 *       200:
 *         description: Returns incoming reassignment requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/getIncomingReassignmentRequests", (ctx) => reassignmentController.getIncomingReassignmentRequests(ctx));
/**
 * @openapi
 * /api/v1/handleReassignmentRequest:
 *   post:
 *     description: Approve or Reject Reassignment Request
 *     tags: [Reassignment]
 *     parameters:
 *       - in: header
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User's staffId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reassignmentId:
 *                 type: number
 *                 description: ID of the reassignment request
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Action to take on the request
 *     responses:
 *       200:
 *         description: Request handled successfully, updates status to approved/rejected
 */
router.post("/handleReassignmentRequest", (ctx) => reassignmentController.handleReassignmentRequest(ctx));
/**
 * @openapi
 * /api/v1/getSubordinateRequestsForTempManager:
 *   get:
 *     description: Get subordinate requests of original manager for temporary manager
 *     tags: [Reassignment]
 *     parameters:
 *       - in: header
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User's staffId
 *     responses:
 *       200:
 *         description: Returns subordinate requests for temporary manager
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No active reassignment found
 */
router.get("/getSubordinateRequestsForTempManager", (ctx) => reassignmentController.getSubordinateRequestsForTempManager(ctx));
/**
 * @openapi
 * /api/v1/getAllLogs:
 *   get:
 *     description: Get all logs
 *     tags: [Logs]
 *     parameters:
 *       - in: header
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User's staffId
 *     responses:
 *       200:
 *         description: Returns all logs
 */
router.get("/getAllLogs", (ctx) => logController.getAllLogs(ctx));
/**
 * @openapi
 * /api/v1/getOwnWithdrawalRequests?staffId={INSERT ID HERE}:
 *   get:
 *     description: Get own withdrawal requests
 *     tags: [Own Withdrawal Requests]
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: number
 *         required: true
 *         description: User's staffId
 *     responses:
 *       200:
 *         description: Returns own withdrawal requests
 */
router.get("/getOwnWithdrawalRequests", (ctx) => withdrawalController.getOwnWithdrawalRequests(ctx));
/**
 * @openapi
 * /api/v1/getSubordinatesWithdrawalRequests:
 *   get:
 *     description: Get withdrawal request from direct and temp subordinates
 *     tags: [All Subordinates' Withdrawal Requests]
 *     parameters:
 *       - in: header
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User's staffId
 *     responses:
 *       200:
 *         description: Returns all subordinates' withdrawal requests from direct and temp subordinates
 */
router.get("/getSubordinatesWithdrawalRequests", (0, checkUserRolePermission_1.checkUserRolePermission)(helpers_1.AccessControl.VIEW_SUB_WITHDRAWAL_REQUEST), (ctx) => withdrawalController.getSubordinatesWithdrawalRequests(ctx));
/**
 * @openapi
 * /api/v1/approveWithdrawalRequest:
 *   post:
 *     description: Approve subordinate's withdrawal request
 *     tags: [Withdrawal Request]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               performedBy:
 *                 type: number
 *                 description: Manager's own staffId
 *               withdrawalId:
 *                 type: number
 *                 description: withdrawalId to be approved
 *             required:
 *               - performedBy
 *               - withdrawalId
 */
router.post("/approveWithdrawalRequest", (ctx) => withdrawalController.approveWithdrawalRequest(ctx));
/**
 * @openapi
 * /api/v1/rejectWithdrawalRequest:
 *   post:
 *     description: Reject subordinate's withdrawal request
 *     tags: [Withdrawal Request]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               performedBy:
 *                 type: number
 *                 description: Manager's own staffId
 *               withdrawalId:
 *                 type: number
 *                 description: withdrawalId to be approved
 *               reason:
 *                 type: number
 *                 description: reason for rejection
 *             required:
 *               - performedBy
 *               - withdrawalId
 *               - reason
 */
router.post("/rejectWithdrawalRequest", (ctx) => withdrawalController.rejectWithdrawalRequest(ctx));
exports.default = router;
