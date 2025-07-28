import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async openAccount(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existingAccount = await this.prisma.account.findUnique({ where: { userId } });
    if (existingAccount) throw new BadRequestException('User already has an account');

    return this.prisma.account.create({
      data: {
        userId,
        balance: 0,
      },
    });
  }

  async closeAccount(userId: number) {
    const account = await this.prisma.account.findUnique({ where: { userId } });
    if (!account) throw new NotFoundException('Account not found');

    if (account.balance !== 0) {
      throw new BadRequestException('Account balance must be zero before closing');
    }

    return this.prisma.account.delete({ where: { userId } });
  }

  async getAccountBalance(userId: number) {
    const account = await this.prisma.account.findUnique({ where: { userId } });
    if (!account) throw new NotFoundException('Account not found');
    return account.balance;
  }
}
