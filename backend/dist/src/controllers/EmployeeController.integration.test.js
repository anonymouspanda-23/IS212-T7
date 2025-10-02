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
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const Employee_1 = __importDefault(require("@/models/Employee"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const utils_1 = require("@/tests/utils");
const index_1 = require("@/index");
const supertest_1 = __importDefault(require("supertest"));
const helpers_1 = require("@/helpers");
// Unmock mongoose and Employee model specifically for integration tests
jest.unmock('mongoose');
jest.unmock('@/models/Employee');
describe('Employee Integration Tests', () => {
    let mongoServer;
    let mockServer;
    const filePath = path_1.default.resolve("@/../script/employee.json");
    const fileContent = (0, fs_1.readFileSync)(filePath, "utf-8");
    const employees = JSON.parse(fileContent);
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Start MongoDB Memory Server
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        // Connect to the in-memory database
        yield mongoose_1.default.connect(mongoUri);
        mockServer = index_1.app.listen();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoServer.stop();
        mockServer.close();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clear all collections
        yield Employee_1.default.deleteMany();
        const EMPLOYEE_LIMIT = 10; // Adjust this value as needed
        // Populate table
        for (let i = 0; i < Math.min(EMPLOYEE_LIMIT, employees.length); i++) {
            const employeeData = employees[i];
            employeeData.hashedPassword = yield (0, utils_1.hashPassword)("password123");
            yield Employee_1.default.create(employeeData);
        }
    }), 60000); // Set limit to 1 min. Default is 5 sec.
    describe('getEmployeeByEmail', () => {
        it('should return employee data when credentials are valid', () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                staffEmail: 'jack.sim@allinone.com.sg',
                staffPassword: 'password123'
            };
            const expectedResponse = {
                staffId: 130002,
                name: 'Jack Sim',
                dept: 'CEO',
                position: 'MD',
                email: 'jack.sim@allinone.com.sg',
                reportingManager: 130002,
                role: 1,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/login")
                .send(requestBody);
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual(expectedResponse);
        }));
        it('should return error for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                staffEmail: 'nonexistent@lurence.org',
                staffPassword: 'password123'
            };
            const expectedResponse = {
                "error": helpers_1.errMsg.USER_DOES_NOT_EXIST
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/login")
                .send(requestBody);
            expect(response.status).toBe(404);
            expect(response.body).toStrictEqual(expectedResponse);
        }));
        it('should return error for incorrect password', () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                staffEmail: 'jack.sim@allinone.com.sg',
                staffPassword: 'wrongpassword'
            };
            const expectedResponse = {
                "error": helpers_1.errMsg.WRONG_PASSWORD
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/login")
                .send(requestBody);
            expect(response.status).toBe(401);
            expect(response.body).toStrictEqual(expectedResponse);
        }));
        it('should return error for missing parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                staffEmail: 'jack.sim@allinone.com.sg'
            };
            const expectedResponse = {
                "error": helpers_1.errMsg.MISSING_PARAMETERS
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/login")
                .send(requestBody);
            expect(response.status).toBe(400);
            expect(response.body).toStrictEqual(expectedResponse);
        }));
    });
    describe('getEmployee', () => {
        it('should return employee data when valid staffId is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = 130002;
            const expectedResponse = {
                staffId: 130002,
                staffFName: 'Jack',
                staffLName: 'Sim',
                dept: 'CEO',
                position: 'MD',
                country: 'Singapore',
                email: 'jack.sim@allinone.com.sg',
                reportingManager: 130002,
                role: 1
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .get(`/api/v1/getEmployee?staffId=${staffId}`);
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual(expectedResponse);
        }));
        it('should return error for missing staffId', () => __awaiter(void 0, void 0, void 0, function* () {
            const expectedResponse = {
                "error": helpers_1.errMsg.MISSING_PARAMETERS
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .get('/api/v1/getEmployee');
            expect(response.status).toBe(400);
            expect(response.body).toStrictEqual(expectedResponse);
        }));
        it("should return error for invalid staffId", () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = 130001;
            const expectedResponse = {
                "error": helpers_1.errMsg.USER_DOES_NOT_EXIST
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .get(`/api/v1/getEmployee?staffId=${staffId}`);
            expect(response.status).toBe(404);
            expect(response.body).toStrictEqual(expectedResponse);
        }));
    });
    describe('getRoleOneOrThreeEmployees', () => {
        it('should return employees with role 1 or 3 for a valid staffId', () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = 130002;
            const response = yield (0, supertest_1.default)(mockServer)
                .get('/api/v1/getRoleOneOrThreeEmployees')
                .set('id', staffId.toString());
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('staffId');
            expect(response.body[0]).toHaveProperty('staffName');
            expect(response.body[0]).toHaveProperty('email');
        }));
        it('should return error for missing id in header', () => __awaiter(void 0, void 0, void 0, function* () {
            const expectedResponse = {
                "error": helpers_1.errMsg.MISSING_HEADER
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .get('/api/v1/getRoleOneOrThreeEmployees');
            expect(response.status).toBe(400);
            expect(response.body).toStrictEqual(expectedResponse);
        }));
    });
});
