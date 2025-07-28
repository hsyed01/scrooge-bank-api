
import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { BankService } from './bank.service';

@Module({
  controllers: [BankController],
  providers: [FinanceService, BankService, PrismaService]
})
export class BankModule {}