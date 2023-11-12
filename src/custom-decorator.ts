//自定义装饰器
import { SetMetadata } from '@nestjs/common';
//来装饰哪些接口是需要登陆的
//支持在 controller 上添加声明，不需要每个 handler 都添加(比如在每个create,findAll等方法前)
export const RequireLogin = () => SetMetadata('require-login', true);

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('require-permission', permissions);
