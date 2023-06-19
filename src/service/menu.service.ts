import {Provide} from "@midwayjs/core";
import {BaseService} from "./base.service";
import * as _ from 'lodash';

/**
 * 菜单
 */
@Provide()
export class MenuService extends BaseService {

  /**
   * 根据角色获得权限信息
   * @param roleIds
   */
  async getPerms(roleIds) {
    let perms = [];
    if (!_.isEmpty(roleIds)) {
      const result = await this.nativeQuery(
        `SELECT a.perms FROM base_sys_menu a ${this.setSql(
          !roleIds.includes('1') ,
          ' JOIN base_sys_role_menu b on a.id = b.menuId AND b.roleId IN (?)' ,
          [roleIds])} where 1=1 and a.perms is not NULL`, [roleIds]
      )
      if (result) {
        result.forEach(d => {
          if (d.perms) {
            perms = perms.concat(d.perms.split(','))
          }
        })
      }
      perms = _.uniq(perms)
      perms = _.remove(perms, n => {
        return !_.isEmpty(n)
      })
    }
    return _.uniq(perms);
  }

  // 获得用户菜单信息
  async getMenus(roleIds, isAdmin) {
    return await this.nativeQuery(
      ` SELECT a.* FROM base_sys_menu a ${this.setSql(!isAdmin , 'JOIN base_sys_role_menu b on a.id = b.menuId AND b.roleId in (?)' , [roleIds])} GROUP BY a.id ORDER BY orderNum ASC`
    )
  }

}
