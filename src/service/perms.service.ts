import {Inject, Provide} from "@midwayjs/core";
import {BaseService} from "./base.service";
import {MenuService} from "./menu.service";
import {Context} from "@midwayjs/koa";


@Provide()
export class PermsService extends BaseService {

  @Inject()
  menuService: MenuService;

  @Inject()
  ctx: Context;

  // 获取权限菜单
  async permmenu(roleIds: number[]) {
    const perms = await this.menuService.getPerms(roleIds);
    const menus = await this.menuService.getMenus(roleIds, this.ctx.admin.username === 'admin')
    return {
      perms,
      menus
    }
  }
}
