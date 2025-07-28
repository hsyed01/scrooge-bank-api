import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

import { AccountModule } from './account/account.module';
import { DepositModule } from './deposit/deposit.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';
import { LoanModule } from './loan/loan.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BankModule } from './bank/bank.module';

@Module({
  imports: [
    AccountModule,
    DepositModule,
    WithdrawalModule,
    LoanModule,
    BankModule,
    UserModule,
    AuthModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
