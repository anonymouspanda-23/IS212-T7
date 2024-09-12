import User from "@/entities/User";
import { DatabaseType, DataSource } from "typeorm";

const progresDatabase: DatabaseType = "postgres";

const AppDataSource = new DataSource({
  type: progresDatabase,
  host: process.env.HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: progresDatabase,
  entities: [User],
  synchronize: true,
});

async function ConnectDatabase() {
  try {
    await AppDataSource.initialize();
  } catch (err) {
    console.log(err);
  }
}

export { AppDataSource, ConnectDatabase };
