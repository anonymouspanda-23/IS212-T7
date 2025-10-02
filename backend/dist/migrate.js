"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    uri: String(process.env.MIGRATE_MONGO_URI),
    collection: "migrations",
    migrationsPath: "./migrations",
    templatePath: "./migrations/template.ts",
    autosync: false,
};
