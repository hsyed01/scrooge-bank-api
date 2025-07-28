import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) { }

  async getBankStats(tx: Prisma.TransactionClient = this.prisma) {
    const [totalDeposits, totalLoans] = await Promise.all([
      tx.account.aggregate({ _sum: { balance: true } }),
      tx.loan.aggregate({ _sum: { amount: true } }),
    ]);

    return {
      totalDeposits: totalDeposits._sum.balance || 0,
      totalLoans: totalLoans._sum.amount || 0,
    };
  }
}
