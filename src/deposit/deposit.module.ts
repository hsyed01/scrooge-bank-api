import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DepositController],
  providers: [DepositService, PrismaService],
})
export class DepositModule {}