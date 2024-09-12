import UrlService from "@/services/UrlService";

class UserController {
  private urlService = new UrlService();

  public async addName(ctx: any) {
    const { name } = ctx.request.body;
    const result = await this.urlService.addName(name);
    ctx.body = result;
  }
}

export default new UserController();
