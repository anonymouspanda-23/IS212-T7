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
exports.up = up;
exports.down = down;
const models_1 = __importDefault(require("@/models"));
const bcrypt_1 = __importDefault(require("bcrypt"));
function up() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const saltRounds = 10;
            const DUMMY_PASSWORD = "password123"; // all users to have the same password
            const { Employee } = yield (0, models_1.default)();
            const users = yield Employee.find();
            for (const user of users) {
                if (!user.hashedPassword) {
                    const hashedPassword = yield bcrypt_1.default.hash(DUMMY_PASSWORD, saltRounds);
                    user.hashedPassword = hashedPassword;
                    console.log(`User ${user.staffFName} password has been hashed`);
                    yield user.save();
                }
            }
        }
        catch (error) {
            console.error("Migration error:", error);
        }
    });
}
function down() {
    return __awaiter(this, void 0, void 0, function* () {
        // Write migration here
    });
}
