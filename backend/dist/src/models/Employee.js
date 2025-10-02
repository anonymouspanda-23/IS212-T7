"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const EmployeeSchema = new Schema({
    staffId: { type: Number, unique: true, required: true },
    staffFName: { type: String, required: true },
    staffLName: { type: String, required: true },
    dept: { type: String, required: true },
    position: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String, required: true },
    hashedPassword: { type: String, required: false },
    reportingManager: {
        type: Number,
        ref: "Employee",
        required: false,
    },
    reportingManagerName: { type: String, required: false },
    role: { type: Number, required: true, enum: [1, 2, 3] },
}, {
    timestamps: true,
    versionKey: false,
});
EmployeeSchema.index({ staffId: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Employee", EmployeeSchema);
