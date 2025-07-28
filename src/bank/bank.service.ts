import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BankService {
  constructor(
    private prisma: PrismaService,
    private financeService: FinanceService
  ) { }

  async getAvailableFunds(tx: Prisma.TransactionClient = this.prisma) {
    const { totalDeposits, totalLoans } = await this.financeService.getBankStats(tx);
    return totalDeposits - totalLoans;
  }
}
