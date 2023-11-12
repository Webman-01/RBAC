import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Role } from './user/entities/role.entity';
import { Reflector } from '@nestjs/core';

//拓展Request的类型
declare module 'express' {
  interface Request {
    user: {
      username: string;
      roles: Role[];
    };
  }
}
@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;
  @Inject()
  private reflector: Reflector;
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    //由于自定义装饰器的要求:=>这里要取出目标 handler 的 metadata 来判断是否需要登录
    // getAllAndOverride第一个参数是元数据的键，第二个参数是要从中获取元数据的对象数组
    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler(),
    ]);
    console.log(requireLogin);
    //如果目标 handler 或者 controller 不包含 require-login 的 metadata，那就放行，否则才检查 jwt
    if (!requireLogin) {
      return true;
    }

    //获取请求头中的authorization
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('用户未登陆');
    }
    try {
      //返回authorization中的身份标识
      //这里不用查数据库，因为 jwt 是用密钥加密的，只要 jwt 能 verify 通过就行
      const token = authorization.split(' ')[1];
      const data = this.jwtService.verify(token);
      //放到request上
      request.user = data.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('token失效,请重新登陆');
    }
  }
}
