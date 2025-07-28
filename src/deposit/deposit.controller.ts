import { Request } from 'express';
import { Controller, Post, Get, UseGuards, Body, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DepositService } from './deposit.service';
import { JwtPayload } from 'src/types';

@Controller('deposit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepositController {
  constructor(private readonly depositService: DepositService) { }

  @Post()
  @Roles('USER')
  deposit(@Req() req: Request, @Body('amount') amount: number) {
    const user = req.user as JwtPayload;
    const userId = user.userId;
    return this.depositService.deposit(userId, amount);
  }

  @Get()
  @Roles('ADMIN')
  allUsers() {
    return this.depositService.findAll();
  }
}
