import {Inject, Provide} from "@midwayjs/core";
import {MenuService} from "./menu.service";
import {Context} from "@midwayjs/koa";
import {RoleService} from "./role.service";
import {CacheManager} from "@midwayjs/cache";
import {DepartmentService} from "./department.service";
import {BaseService} from "../components/core/src";


@Provide()
export class PermsService extends BaseService {

  @Inject()
  menuService: MenuService;

  @Inject()
  ctx: Context;

  @Inject()
  roleService: RoleService;

  @Inject()
  cacheManager: CacheManager;

  @Inject()
  departmentService: DepartmentService;

  // 获取权限菜单
  async permmenu(roleIds: number[]) {
    const perms = await this.menuService.getPerms(roleIds);
    const menus = await this.menuService.getMenus(roleIds, this.ctx.admin.username === 'admin')
    return {
      perms,
      menus
    }
  }

  // 刷新权限
  async refreshPerms(userId) {
    const roleIds = await this.roleService.getByUser(userId)
    const perms = await this.menuService.getPerms(roleIds)
    await this.cacheManager.set(`admin:perms:${userId}`, perms);
    // 更新部门权限
    const departments = await this.departmentService.getByRoleIds(
      roleIds,
      this.ctx.admin.username === 'admin'
    )
    await this.cacheManager.set(`admin:department:${userId}`, departments);
  }

  // 根据用户ID获得部门权限
  async departmentIds(userId: number) {
    const department: any = await this.cacheManager.get(`admin:department:${userId}`)
    if (department) {
      return department
    } else {
      return []
    }
  }

}
