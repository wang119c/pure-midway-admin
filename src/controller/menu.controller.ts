import {Body, Inject, Post, Provide} from "@midwayjs/core";
import {BaseController} from "../components/core";
import {MenuService} from "../service/menu.service";

@Provide()
export class MenuController extends BaseController {
  @Inject()
  menuService: MenuService;

  @Post('/parse', {
    summary: "解析"
  })
  async parse(
    @Body('entity') entity: string,
    @Body('controller') controller: string,
    @Body('module') module: string
  ) {
    return this.ok(
      await this.menuService.parse(entity, controller, module)
    )
  }
}
