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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const filePath = path_1.default.resolve(__dirname, "../script/reassignment.json");
const fileContent = (0, fs_1.readFileSync)(filePath, "utf-8");
const reassignmentData = JSON.parse(fileContent);
function up() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { Reassignment } = yield (0, models_1.default)();
            for (const data of reassignmentData) {
                yield Reassignment.create(data);
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
