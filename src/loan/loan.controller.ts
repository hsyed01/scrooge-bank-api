import { Controller, Post, Patch, Get, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { LoanService } from './loan.service';

@Controller('loan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanController {
  constructor(private readonly loanService: LoanService) { }

  @Post(':userId/apply')
  @Roles('USER')
  apply(@Param('userId') userId: string, @Body('amount') amount: number) {
    return this.loanService.apply(+userId, amount);
  }

  @Patch(':userId/pay')
  @Roles('USER')
  pay(@Param('userId') userId: string, @Body('amount') amount: number) {
    return this.loanService.pay(+userId, amount);
  }

  @Get(':userId')
  @Roles('USER')
  getLoan(@Param('userId') userId: string) {
    return this.loanService.getLoan(+userId);
  }
}
