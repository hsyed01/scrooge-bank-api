import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WithdrawalService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return await this.prisma.withdrawal.findMany();
  }

  async withdraw(userId: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { userId } });
      if (!account) {
        throw new NotFoundException('Account not found');
      }

      if (account.balance < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      await tx.withdrawal.create({
        data: {
          userId,
          amount,
        },
      });

      const updated = await tx.account.update({
        where: { userId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      return { newBalance: updated.balance };
    });
  }
}
