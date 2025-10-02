"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const config_1 = require("./config");
// import { Mailer } from "./config/mailer";
const PORT = process.env.PORT || 3001;
// const mailer = Mailer.getInstance();
index_1.app.listen(PORT, () => {
    console.log(`🚀 Server listening on localhost:${PORT} 🚀`);
    (0, config_1.initDB)();
    (0, config_1.startCronJob)();
    // mailer.getTransporter();
});
