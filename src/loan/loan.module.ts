import { Module } from '@nestjs/common';
import { LoanService } from './loan.service';
import { FinanceService } from '../finance/finance.service';
import { LoanController } from './loan.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LoanController],
  providers: [FinanceService, LoanService, PrismaService],
})
export class LoanModule {}