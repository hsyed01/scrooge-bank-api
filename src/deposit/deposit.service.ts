import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepositService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    return await this.prisma.deposit.findMany();
  }

  async deposit(userId: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be greater than zero');
    }

    return await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { userId } });
      if (!account) throw new NotFoundException('Account not found');

      await tx.deposit.create({
        data: {
          userId,
          amount,
        },
      });

      const updated = await tx.account.update({
        where: { userId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      return { newBalance: updated.balance };
    });
  }
}
