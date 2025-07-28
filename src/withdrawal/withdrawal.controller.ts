import { Request } from 'express';
import { Controller, Post, Get, UseGuards, Body, Req } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtPayload } from 'src/types';

@Controller('withdrawal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) { }

  @Post()
  @Roles('USER')
  withdraw(@Req() req: Request, @Body('amount') amount: number) {
    const user = req.user as JwtPayload;
    const userId = user.userId;
    return this.withdrawalService.withdraw(userId, amount);
  }

  @Get()
  @Roles('ADMIN')
  allUsers() {
    return this.withdrawalService.findAll();
  }
}
