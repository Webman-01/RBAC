import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user/user.service';
import { Request } from 'express';
import { Permission } from './user/entities/permission.entity';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(UserService)
  private userService: UserService;

  @Inject(Reflector) //获取元信息
  private reflector: Reflector;
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    //因为这个 PermissionGuard 在 LoginGuard 之后调用（在 AppModule 里声明在 LoginGuard 之后），所以走到这里 request 里就有 user 对象了,但也不一定，因为 LoginGuard 没有登录也可能放行，所以要判断下 request.user 如果没有，这里也放行
    if (!request.user) {
      return true;
    }
    // 取出 user 的 roles 的 id，查出 roles 的 permission 信息，然后合并到一个数组里
    const roles = await this.userService.findRolesByIds(
      request.user.roles.map((item) => item.id),
    );

    const permissions: Permission[] = roles.reduce((total, current) => {
      total.push(...current.permissions);
      return total;
    }, []);
    console.log(permissions); //用户有的权限

    const requirePermissions = this.reflector.getAllAndOverride(
      'require-permission',
      [context.getHandler(), context.getClass()],
    );
    console.log(requirePermissions); //接口需要的权限

    //判断是否有权限访问某个接口
    for (let i = 0; i < requirePermissions.length; i++) {
      const curPermission = requirePermissions[i];
      const found = permissions.find((item) => item.name == curPermission);
      if (!found) {
        throw new UnauthorizedException('没有访问该接口的权限');
      }
    }

    return true;
  }
}
