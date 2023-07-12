import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(userData: any) {
    const newUser = await this.prismaService.user.create({
      data: { ...userData },
    });
    return newUser;
  }

  async findOne(property: any) {
    const user = await this.prismaService.user.findFirst({
      where: { ...property },
    });
    return user;
  }

  async update(condition: any, data: any) {
    const user = await this.prismaService.user.update({
      where: { ...condition },
      data,
    });
    return user;
  }

  async updateMany(condition: any, data: any) {
    const users = await this.prismaService.user.updateMany({
      where: { ...condition },
      data,
    });
    return users;
  }
}
