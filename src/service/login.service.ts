import {Config, HttpStatus, Inject, Provide} from '@midwayjs/core';
import {BaseService} from './base.service';
import {CaptchaService} from '@midwayjs/captcha';
import {CustomHttpError} from '../error/customHttp.error';
import {RES_MESSAGE} from '../constant';
import {JwtService} from '@midwayjs/jwt';
import {LoginDTO} from "../dto/login.dto";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {UserEntity} from "../entity/user.entity";
import {Repository} from "typeorm";
import {sha256} from "../utils/encrypt";

// 登录

@Provide()
export class LoginService extends BaseService {
  @Inject()
  private captchaService: CaptchaService;
  @Inject()
  private jwtService: JwtService;
  @Config('jwt')
  jwtConfig;
  @InjectEntityModel(UserEntity)
  userEntity: Repository<UserEntity>;


  /**
   * 验证码
   * @param type
   * @param width
   * @param height
   * @param color
   */
  async captcha(width = 150, height = 50): Promise<object> {
    const {id, imageBase64} = await this.captchaService.image({
      width,
      height,
    });
    return {
      id,
      imageBase64,
    };
  }

  /**
   * 验证验证码
   * @param captchaId
   * @param value
   */
  async captchaCheck(captchaId, value) {
    return await this.captchaService.check(captchaId, value);
  }

  /**
   * 登录
   * @param login
   */
  async login(login: LoginDTO) {
    const {username, captchaId, verifyCode, password} = login
    // 校验验证码
    // const checkV = await this.captchaCheck(captchaId, verifyCode)
    // if (!checkV) throw new CustomHttpError('验证码不正确')
    const user = await this.userEntity.findOneBy({username})
    // 校验用户
    if (!user) throw new CustomHttpError('账户或密码不正确')
    console.log("====", username, password, captchaId, verifyCode, user)
    // 校验用户状态及密码
    if (Number(user.status) === 0 || user.password !== sha256(password)) throw new CustomHttpError('账户或密码不正确')

  }

  /**
   * 刷新token
   * @param token
   */
  async refreshToken(token: string) {
    try {
      await this.jwtService.verify(token, this.jwtConfig.jwt.secret);
    } catch (error) {
      throw new CustomHttpError(RES_MESSAGE.TokenFail, HttpStatus.FORBIDDEN);
    }
  }
}
