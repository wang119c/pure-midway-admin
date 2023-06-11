import {Controller, Get} from "@midwayjs/core";

@Controller('/')
export class WelcomeController {

  @Get('/')
  async welcome(): Promise<string> {
    return 'hello world'
  }
}
