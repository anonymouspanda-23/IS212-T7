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
exports.startCronJob = exports.initDB = void 0;
const mailer_1 = __importDefault(require("@/config/mailer"));
const EmployeeDb_1 = __importDefault(require("@/database/EmployeeDb"));
const LogDb_1 = __importDefault(require("@/database/LogDb"));
const ReassignmentDb_1 = __importDefault(require("@/database/ReassignmentDb"));
const RequestDb_1 = __importDefault(require("@/database/RequestDb"));
const WithdrawalDb_1 = __importDefault(require("@/database/WithdrawalDb"));
const CronJob_1 = __importDefault(require("@/services/CronJob"));
const EmployeeService_1 = __importDefault(require("@/services/EmployeeService"));
const LogService_1 = __importDefault(require("@/services/LogService"));
const NotificationService_1 = __importDefault(require("@/services/NotificationService"));
const ReassignmentService_1 = __importDefault(require("@/services/ReassignmentService"));
const RequestService_1 = __importDefault(require("@/services/RequestService"));
const WithdrawalService_1 = __importDefault(require("@/services/WithdrawalService"));
const mongoose_1 = __importDefault(require("mongoose"));
const startCronJob = () => __awaiter(void 0, void 0, void 0, function* () {
    const requestDb = new RequestDb_1.default();
    const employeeDb = new EmployeeDb_1.default();
    const employeeService = new EmployeeService_1.default(employeeDb);
    const mailer = mailer_1.default.getInstance();
    const notificationService = new NotificationService_1.default(employeeService, mailer);
    const logDb = new LogDb_1.default();
    const reassignmentDb = new ReassignmentDb_1.default();
    const logService = new LogService_1.default(logDb, employeeService, reassignmentDb);
    const reassignmentService = new ReassignmentService_1.default(reassignmentDb, requestDb, employeeService, logService, notificationService);
    const requestService = new RequestService_1.default(logService, employeeService, notificationService, requestDb, reassignmentService);
    const withdrawalDb = new WithdrawalDb_1.default();
    const withdrawalService = new WithdrawalService_1.default(logService, withdrawalDb, requestService, reassignmentService, employeeService, notificationService);
    const job = new CronJob_1.default(requestService, reassignmentService, withdrawalService);
    job.execute();
});
exports.startCronJob = startCronJob;
const initDB = () => {
    mongoose_1.default.connect(String(process.env.CONNECTION_STRING));
    mongoose_1.default.connection.once("open", () => {
        console.log("💿 Connected to MongoDB 💿");
    });
    mongoose_1.default.connection.on("error", console.error);
};
exports.initDB = initDB;
