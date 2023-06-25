// 系统用户
import {Body, Inject, Post, Provide} from "@midwayjs/core";
import {UserService} from "../service/user.service";
import {UserEntity} from "../entity/base/user.entity";
import {PureController , BaseController} from "../components/core/src";
@Provide()
@PureController({
  prefix: "/admin/user",
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: UserEntity,
  service: UserService,
})
export class UserController extends BaseController {
  @Inject()
  userService: UserService;

  // 移动部门
  @Post("/move" , {
    summary: "移动部门"
  })
  async move(
    @Body('departmentId') departmentId: number,
    @Body('userIds') userIds: []
  ){
    await this.userService.move(departmentId,userIds)
    return this.ok()
  }

}
