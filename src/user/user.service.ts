import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserLoginDto } from './dto/UserLoginDto';

@Injectable()
export class UserService {
  @InjectEntityManager()
  entityManager: EntityManager;

  //创建一些数据
  async initData() {
    const user1 = new User();
    user1.username = '张三';
    user1.password = '111111';

    const user2 = new User();
    user2.username = '李四';
    user2.password = '222222';

    const user3 = new User();
    user3.username = '王五';
    user3.password = '333333';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.name = '新增 aaa';

    const permission2 = new Permission();
    permission2.name = '修改 aaa';

    const permission3 = new Permission();
    permission3.name = '删除 aaa';

    const permission4 = new Permission();
    permission4.name = '查询 aaa';

    const permission5 = new Permission();
    permission5.name = '新增 bbb';

    const permission6 = new Permission();
    permission6.name = '修改 bbb';

    const permission7 = new Permission();
    permission7.name = '删除 bbb';

    const permission8 = new Permission();
    permission8.name = '查询 bbb';

    role1.permissions = [
      permission1,
      permission2,
      permission3,
      permission4,
      permission5,
      permission6,
      permission7,
      permission8,
    ];

    role2.permissions = [permission1, permission2, permission3, permission4];

    user1.roles = [role1];

    user2.roles = [role2];

    user3.roles = [role2];

    await this.entityManager.save(Permission, [
      permission1,
      permission2,
      permission3,
      permission4,
      permission5,
      permission6,
      permission7,
      permission8,
    ]);

    await this.entityManager.save(Role, [role1, role2]);

    await this.entityManager.save(User, [user1, user2, user3]);
  }
  //登陆方法
  async login(loginUserDto: UserLoginDto) {
    const user = await this.entityManager.findOne(User, {
      where: {
        username: loginUserDto.username,
      },
      //添加关联查询角色表
      relations: {
        roles: true,
      },
    });
    if (!user) {
      throw new HttpException('该用户不存在', HttpStatus.ACCEPTED); //说明状态：还在接收
    }
    if (user.password != loginUserDto.password) {
      throw new HttpException('密码错误', HttpStatus.ACCEPTED);
    }
    return user;
  }
  //查询role信息
  async findRolesByIds(roleIds: number[]) {
    return await this.entityManager.find(Role, {
      where: {
        id: In(roleIds), //In 是一个查询操作符，用于在数据库查询中指定多个值进行匹配
      },
      relations: {
        permissions: true,
      },
    });
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
