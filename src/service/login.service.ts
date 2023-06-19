import {Config, HttpStatus, Inject, Provide} from '@midwayjs/core';
import {BaseService} from './base.service';
import {CaptchaService} from '@midwayjs/captcha';
import {CustomHttpError} from '../error/customHttp.error';
import {RES_MESSAGE} from '../constant';
import {JwtService} from '@midwayjs/jwt';
import {LoginDTO} from '../dto/login.dto';
import {InjectEntityModel} from '@midwayjs/typeorm';
import {UserEntity} from '../entity/user.entity';
import {Repository} from 'typeorm';
import {sha256} from '../utils/encrypt';
import {RedisService} from '@midwayjs/redis';
import {CacheManager} from '@midwayjs/cache';
import {RoleService} from "./role.service";
import * as  _ from 'lodash';
import {MenuService} from "./menu.service";
import {DepartmentService} from "./department.service";

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
  @Inject()
  redisService: RedisService;
  @Inject()
  cacheManager: CacheManager;
  @Inject()
  roleService: RoleService;
  @Inject()
  menuService: MenuService;
  @Inject()
  departmentService: DepartmentService;

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
    const {username, captchaId, verifyCode, password} = login;
    // 校验验证码
    // const checkV = await this.captchaCheck(captchaId, verifyCode)
    // if (!checkV) throw new CustomHttpError('验证码不正确')
    const user = await this.userEntity.findOneBy({username});
    // 校验用户
    if (!user) throw new CustomHttpError('账户或密码不正确');
    console.log('====', username, sha256(password), captchaId, verifyCode, user);
    // 校验用户状态及密码
    if (Number(user.status) === 0 || user.password !== sha256(password))
      throw new CustomHttpError('账户或密码不正确');
    // 校验角色
    const roleIds = await this.roleService.getByUser(user.id)
    if (_.isEmpty(roleIds)) {
      throw new CustomHttpError('该用户未设置任何角色，无法登录~');
    }
    // 生成token
    const {expire, refreshExpire} = this.jwtConfig.token;
    const result = {
      expire,
      token: await this.generateToken(user, roleIds, expire),
      refreshExpire,
      refreshToken: await this.generateToken(
        user,
        roleIds,
        refreshExpire,
        true
      )
    };

    // 将用户相关信息保存到缓存
    const perms = await this.menuService.getPerms(roleIds)
    const departments = await this.departmentService.getByRoleIds(
      roleIds,
      user.username === 'admin'
    )
    await this.cacheManager.set(`admin:department:${user.id}`, departments);
    await this.cacheManager.set(`admin:perms:${user.id}`, perms);
    await this.cacheManager.set(`admin:token:${user.id}`, result.token);
    await this.cacheManager.set(
      `admin:token:refresh:${user.id}`,
      result.token
    );
    return result
  }

  /**
   * 生成token
   * @param user
   * @param roleIds
   * @param expire
   * @param isRefresh
   * @returns
   */
  async generateToken(user, roleIds, expire, isRefresh?) {
    await this.cacheManager.set(
      `admin:passwordVersion:${user.id}`,
      user.passwordV
    );
    const tokenInfo = {
      isRefresh: false,
      username: user.username,
      roleIds,
      userId: user.id,
      passwordVersion: user.passwordV,
    };
    if (isRefresh) {
      tokenInfo.isRefresh = true;
    }
    return await this.jwtService.sign(tokenInfo);
  }

  /**
   * 刷新token
   * @param token
   */
  async refreshToken(token: string) {
    try {
      const decoded = await this.jwtService.verify(token, this.jwtConfig.jwt.secret);
      if (decoded && decoded['isRefresh']) {
        delete decoded['exp'];
        delete decoded['iat'];
        const {expire, refreshExpire} = this.jwtConfig.token;
        decoded['isRefresh'] = false;
        const result = {
          expire,
          token: this.jwtService.sign(decoded, this.jwtConfig.secret, {
            expiresIn: expire,
          }),
          refreshExpire,
          refreshToken: '',
        };
        decoded['isRefresh'] = true;
        result.refreshToken = this.jwtConfig.sign(decoded, this.jwtConfig.secret, {
          expiresIn: refreshExpire,
        });
        await this.cacheManager.set(
          `admin:passwordVersion:${decoded['userId']}`,
          decoded['passwordVersion']
        );
        await this.cacheManager.set(
          `admin:token:${decoded['userId']}`,
          result.token
        );
        return result;
      }
    } catch (error) {
      throw new CustomHttpError(RES_MESSAGE.TokenFail, HttpStatus.FORBIDDEN);
    }
  }
}
