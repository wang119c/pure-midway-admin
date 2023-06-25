import {ALL, Config, Provide} from "@midwayjs/core";
import * as _ from 'lodash';
import {BaseService} from "../components/core/src";
import {TempDataSource} from "./data";
import {PureCommException} from "../components/core";
import * as ts from 'typescript';

/**
 * 菜单
 */
@Provide()
export class MenuService extends BaseService {

  @Config(ALL)
  config;

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

  // 解析实体和Controller
  async parse(entityString: string, controller: string, module: string) {
    const tempDataSource = new TempDataSource({
      ...this.config.typeorm.dataSource.default,
      entities: [],
    });
    // 连接数据库
    await tempDataSource.initialize();
    const {newCode, className} = this.parseCode(entityString);
    const code = ts.transpile(
      `${newCode}
        tempDataSource.options.entities.push(${className})
        `,
      {
        emitDecoratorMetadata: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2018,
        removeComments: true,
      }
    );
    eval(code);
    await tempDataSource.buildMetadatas();
    const columnArr = tempDataSource.getMetadata(className).columns;
    await tempDataSource.destroy();
    const fileName = await this.fileName(controller);
    const commColums = [];
    const columns = _.filter(
      columnArr.map(e => {
        return {
          propertyName: e.propertyName,
          type: typeof e.type == 'string' ? e.type : e.type.name.toLowerCase(),
          length: e.length,
          comment: e.comment,
          nullable: e.isNullable,
        };
      }),
      o => {
        if (['createTime', 'updateTime'].includes(o.propertyName)) {
          commColums.push(o);
        }
        return o && !['createTime', 'updateTime'].includes(o.propertyName);
      }
    ).concat(commColums);
    return {
      columns,
      path: `/admin/${module}/${fileName}`,
    };
  }


  // 找到文件名
  async fileName(controller: string) {
    const regex = /import\s*{\s*\w+\s*}\s*from\s*'[^']*\/([\w-]+)';/;
    const match = regex.exec(controller);
    if (match && match.length > 1) {
      return match[1];
    }
    return null;
  }

  // 解析Entity类名
  parseCode(code: string) {
    try {
      const oldClassName = code
        .match('class(.*)extends')[1]
        .replace(/\s*/g, '');
      const oldTableStart = code.indexOf('@Entity(');
      const oldTableEnd = code.indexOf(')');

      const oldTableName = code
        .substring(oldTableStart + 9, oldTableEnd - 1)
        .replace(/\s*/g, '')
        // eslint-disable-next-line no-useless-escape
        .replace(/\"/g, '')
        // eslint-disable-next-line no-useless-escape
        .replace(/\'/g, '');
      const className = `${oldClassName}TEMP`;
      return {
        newCode: code
          .replace(oldClassName, className)
          .replace(oldTableName, `func_${oldTableName}`),
        className,
        tableName: `func_${oldTableName}`,
      };
    } catch (err) {
      throw new PureCommException('代码结构不正确，请检查');
    }
  }


}
