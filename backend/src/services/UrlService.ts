import UserDb from "@/database/UserDb";

class UserService {
  private userDb = new UserDb();

  public async addName(name: string) {
    // Process business logic here
    // Save it to database layer
    await this.userDb.saveNameToDb(name);

    return "Name added";
  }
}

export default UserService;
