import {ALL, Body, Inject, Post, Provide} from "@midwayjs/core";
import {BaseController, PureController} from "../components/core";
import {DepartmentEntity} from "../entity/base/department.entity";
import {DepartmentService} from "../service/department.service";


// 部门
@Provide()
@PureController({
  api: ['add', 'delete', 'update', 'list'],
  entity: DepartmentEntity,
  service: DepartmentService
})
export class DepartmentController extends BaseController {
  @Inject()
  departmentService: DepartmentService;

  // 部门排序
  @Post('/order', {
    summary: "排序"
  })
  async order(@Body(ALL) params: any) {
    await this.departmentService.order(params)
    return this.ok()
  }
}
