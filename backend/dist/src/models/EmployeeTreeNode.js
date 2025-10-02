"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmployeeTreeNode {
    constructor(employee, department, subordinates) {
        this.employee = employee;
        this.department = department;
        this.subordinates = subordinates;
    }
    getEmployee() {
        return this.employee;
    }
    getDepartment() {
        return this.department;
    }
    getSubordinates() {
        return this.subordinates;
    }
    addSubordinate(subordinate) {
        if (this.subordinates === null)
            this.subordinates = [];
        this.subordinates.push(subordinate);
    }
}
exports.default = EmployeeTreeNode;
