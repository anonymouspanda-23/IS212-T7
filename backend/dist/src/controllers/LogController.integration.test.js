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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("@/helpers");
const index_1 = require("@/index");
const Employee_1 = __importDefault(require("@/models/Employee"));
const Log_1 = __importDefault(require("@/models/Log"));
const utils_1 = require("@/tests/utils");
const fs_1 = require("fs");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const supertest_1 = __importDefault(require("supertest"));
jest.mock("nodemailer");
jest.unmock("mongoose");
jest.unmock("@/models/Log");
jest.unmock("@/models/Employee");
const mockCounter = {
    seq: 1,
};
jest.mock("@/helpers/counter", () => ({
    Counter: {
        findByIdAndUpdate: jest.fn(() => {
            return Promise.resolve({ seq: mockCounter.seq++ });
        }),
    },
    initializeCounter: jest.fn(() => Promise.resolve()),
}));
describe("Log Integration Test", () => {
    let mongoServer;
    let mockServer;
    const employeeFilePath = path_1.default.resolve("@/../script/employee.json");
    const employeeFileContent = (0, fs_1.readFileSync)(employeeFilePath, "utf-8");
    const employees = JSON.parse(employeeFileContent);
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        yield mongoose_1.default.connect(mongoUri);
        mockServer = index_1.app.listen();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoServer.stop();
        mockServer.close();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Employee_1.default.deleteMany();
        const EMPLOYEE_LIMIT = 10;
        for (let i = 0; i < Math.min(EMPLOYEE_LIMIT, employees.length); i++) {
            const employeeData = employees[i];
            employeeData.hashedPassword = yield (0, utils_1.hashPassword)("password123");
            yield Employee_1.default.create(employeeData);
        }
        yield Log_1.default.deleteMany();
        const logs = [
            {
                logId: 1,
                performedBy: 140001,
                staffName: "Derek Tan",
                dept: "Sales",
                position: "Sales Manager",
                reportingManagerId: 140894,
                managerName: "Rahim Khalid",
                requestId: 1,
                requestType: helpers_1.Request.APPLICATION,
                action: helpers_1.Action.APPLY,
                reason: "Request for annual leave.",
            },
            {
                logId: 2,
                performedBy: 140001,
                staffName: "Derek Tan",
                dept: "Sales",
                position: "Sales Manager",
                reportingManagerId: 140894,
                managerName: "Rahim Khalid",
                requestId: 2,
                requestType: helpers_1.Request.WITHDRAWAL,
                action: helpers_1.Action.CANCEL,
                reason: "Cancelled due to personal reasons.",
            },
            {
                logId: 3,
                performedBy: 140002,
                staffName: "Jane Doe",
                dept: "Engineering",
                position: "Software Engineer",
                reportingManagerId: 140895,
                managerName: "John Smith",
                requestId: 3,
                requestType: helpers_1.Request.REASSIGNMENT,
                action: helpers_1.Action.REASSIGN,
                reason: null,
            },
            {
                logId: 4,
                performedBy: 140003,
                staffName: "Alice Johnson",
                dept: "HR",
                position: "HR Manager",
                reportingManagerId: 140896,
                managerName: "Susan Lee",
                requestId: 4,
                requestType: helpers_1.Request.APPLICATION,
                action: helpers_1.Action.APPROVE,
                reason: "Approved after review.",
            },
        ];
        yield Log_1.default.insertMany(logs);
    }));
    describe("getAllLogs", () => {
        it("should return all logs for the given staff ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = 140001;
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getAllLogs")
                .set("id", staffId.toString());
            const expectedResult = {
                Engineering: {
                    "Software Engineer": [
                        {
                            action: "REASSIGN",
                            dept: "Engineering",
                            logId: 3,
                            performedBy: 140002,
                            position: "Software Engineer",
                            reason: null,
                            requestId: 3,
                            requestType: "REASSIGNMENT",
                            staffName: "Jane Doe",
                        },
                    ],
                },
                HR: {
                    "HR Manager": [
                        {
                            action: "APPROVE",
                            dept: "HR",
                            logId: 4,
                            performedBy: 140003,
                            position: "HR Manager",
                            reason: "Approved after review.",
                            requestId: 4,
                            requestType: "APPLICATION",
                            staffName: "Alice Johnson",
                        },
                    ],
                },
                Sales: {
                    "Sales Manager": [
                        {
                            action: "APPLY",
                            dept: "Sales",
                            logId: 1,
                            performedBy: 140001,
                            position: "Sales Manager",
                            reason: "Request for annual leave.",
                            requestId: 1,
                            requestType: "APPLICATION",
                            staffName: "Derek Tan",
                        },
                        {
                            action: "CANCEL",
                            dept: "Sales",
                            logId: 2,
                            performedBy: 140001,
                            position: "Sales Manager",
                            reason: "Cancelled due to personal reasons.",
                            requestId: 2,
                            requestType: "WITHDRAWAL",
                            staffName: "Derek Tan",
                        },
                    ],
                },
            };
            expect(response.status).toBe(200);
            const stripCreatedAtField = (logs) => {
                return logs.map((_a) => {
                    var { createdAt } = _a, rest = __rest(_a, ["createdAt"]);
                    return rest;
                });
            };
            const normalizedResponseBody = {};
            Object.entries(response.body).forEach(([dept, positions]) => {
                normalizedResponseBody[dept] = {};
                Object.entries(positions).forEach(([position, logs]) => {
                    normalizedResponseBody[dept][position] = stripCreatedAtField(logs);
                });
            });
            expect(normalizedResponseBody).toEqual(expectedResult);
        }));
        it("should return an error if no id is provided in the header", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer).get("/api/v1/getAllLogs");
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ error: helpers_1.errMsg.MISSING_HEADER });
        }));
        it("should return an empty object if no logs are found for the given staff id", () => __awaiter(void 0, void 0, void 0, function* () {
            const noLogsStaffId = 140025;
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getAllLogs")
                .set("id", noLogsStaffId.toString());
            const expectedResult = {
                Sales: {
                    "Account Manager": [],
                },
            };
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expectedResult);
        }));
    });
});
