import {BaseController} from "./base.controller";
import {ALL, Body, Get, Inject, Post, Provide} from "@midwayjs/core";
import {UserService} from "../service/user.service";
import {PureController} from "../decorator/controller.decorator";
import {PureUrlTag, TagTypes} from "../decorator/tag";
import {UserEntity} from "../entity/user.entity";
import {PermsService} from "../service/perms.service";
import {Context} from "@midwayjs/koa";
import {PureFile} from "../../packages/file";

@PureUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['eps']
})
@Provide()
@PureController("/admin/comm")
export class CommController extends BaseController {

  @Inject()
  userService: UserService;

  @Inject()
  permsService: PermsService;

  @Inject()
  ctx: Context;

  @Inject()
  pureFile: PureFile;

  // 获取个人信息
  @Get('/person', {
    summary: "个人信息"
  })
  async person() {
    return this.ok(await this.userService.person())
  }

  // 修改个人信息
  @Post('/personUpdate', {
    summary: "修改个人信息"
  })
  async personUpdate(@Body(ALL) user: UserEntity) {
    await this.userService.personUpdate(user)
    return this.ok()
  }

  // 权限菜单
  @Get('/permmenu', {
    summary: "权限与菜单"
  })
  async permmenu() {
    const res = await this.permsService.permmenu(this.ctx.admin.roleIds)
    return this.ok(res)
  }

  // 文件上传
  @Post('/upload', {
    summary: "文件上传"
  })
  async upload() {
    const res = await this.pureFile.upload(this.ctx)
    return this.ok(res)
  }


}
