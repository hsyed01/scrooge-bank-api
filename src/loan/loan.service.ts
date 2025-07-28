import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';


@Injectable()
export class LoanService {
  constructor(
    private prisma: PrismaService, 
    private financeService: FinanceService
  ) { }

  async apply(userId: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Loan amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { account: true },
      });

      if (!user || !user.account) {
        throw new NotFoundException('User or account not found');
      }

      const stats = await this.financeService.getBankStats(tx);
      const loanable = 250000 + stats.totalDeposits * 0.25 - stats.totalLoans;

      if (loanable < amount) {
        throw new ForbiddenException('Bank cannot cover this loan');
      }

      return tx.loan.create({
        data: {
          userId,
          amount,
          paid: 0,
        },
      });
    });
  }

  async pay(userId: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findFirst({ where: { userId } });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      const remaining = loan.amount - loan.paid;
      const payment = Math.min(remaining, amount);

      return tx.loan.update({
        where: { id: loan.id },
        data: {
          paid: {
            increment: payment,
          },
        },
      });
    });
  }

  async getLoan(userId: number) {
    const loan = await this.prisma.loan.findFirst({ where: { userId } });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return {
      amount: loan.amount,
      paid: loan.paid,
      remaining: loan.amount - loan.paid,
    };
  }
}
