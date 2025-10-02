import "module-alias/register";
import { app } from "./index";
import { initDB, startCronJob } from "./config";
// import { Mailer } from "./config/mailer";

const PORT = process.env.PORT || 3001;
// const mailer = Mailer.getInstance();

app.listen(PORT, () => {
  console.log(`🚀 Server listening on localhost:${PORT} 🚀`);
  initDB();
  startCronJob();
  // mailer.getTransporter();
});