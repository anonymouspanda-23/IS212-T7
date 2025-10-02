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
const Employee_1 = __importDefault(require("@/models/Employee"));
const EmployeeTreeNode_1 = __importDefault(require("@/models/EmployeeTreeNode"));
class EmployeeDb {
    getEmployee(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield Employee_1.default.findOne({ staffId }, "-_id -createdAt -updatedAt -hashedPassword");
            return employee;
        });
    }
    getEmployeeByEmail(userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Employee_1.default.findOne({
                email: userEmail,
            }, "-_id -createdAt -updatedAt").exec();
        });
    }
    getAllDeptTeamCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Employee_1.default.aggregate([
                {
                    $group: {
                        _id: { dept: "$dept", position: "$position" },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { "_id.dept": 1, "_id.position": 1 },
                },
            ]);
            let sanitisedResult = {};
            result.forEach((item) => {
                const department = item._id.dept;
                const position = item._id.position;
                const count = item.count;
                if (!sanitisedResult[department]) {
                    sanitisedResult[department] = { teams: {} };
                }
                sanitisedResult[department].teams[position] = count;
                sanitisedResult[department].wfhStaff = [];
            });
            return sanitisedResult;
        });
    }
    getDeptByManager(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const employeeHierarchy = yield Employee_1.default.aggregate([
                { $match: { staffId } },
                {
                    $graphLookup: {
                        from: "employees",
                        startWith: staffId,
                        connectFromField: "staffId",
                        connectToField: "reportingManager",
                        as: "subordinates",
                        maxDepth: 100,
                        depthField: "level",
                    },
                },
            ]);
            if (employeeHierarchy.length === 0) {
                throw new Error("Employee not found");
            }
            const root = new EmployeeTreeNode_1.default(employeeHierarchy[0].staffId, employeeHierarchy[0].dept, null);
            let queue = [root];
            let seen = [root.getEmployee()];
            let subordinates = employeeHierarchy[0].subordinates;
            while (queue.length > 0) {
                let current = queue.shift();
                if (current === undefined) {
                    continue;
                }
                const directSubordinates = subordinates.filter((sub) => sub.reportingManager === current.getEmployee());
                for (const subordinate of directSubordinates) {
                    const subordinateStaffId = subordinate.staffId;
                    const subordinateDept = subordinate.dept;
                    if (subordinateStaffId in seen) {
                        continue;
                    }
                    seen.push(subordinateStaffId);
                    const subordinateTreeNode = new EmployeeTreeNode_1.default(subordinateStaffId, subordinateDept, null);
                    current.addSubordinate(subordinateTreeNode);
                    queue.push(subordinateTreeNode);
                }
            }
            return root;
        });
    }
    getRoleOneOrThreeEmployees(staffId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const employees = yield Employee_1.default.aggregate([
                {
                    $match: {
                        role: { $eq: role },
                        staffId: { $nin: [staffId, 130002] },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        staffId: 1,
                        staffName: { $concat: ["$staffFName", " ", "$staffLName"] },
                        dept: 1,
                        position: 1,
                        email: 1,
                        role: 1,
                    },
                },
            ]);
            return employees;
        });
    }
}
exports.default = EmployeeDb;
