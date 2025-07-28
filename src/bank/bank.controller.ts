import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BankService } from './bank.service';

@Controller('bank')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BankController {
  constructor(private bankService: BankService) {}

  @Get('funds')
  @Roles('ADMIN')
  async getFunds() {
    const amount = await this.bankService.getAvailableFunds();
    return { amount };
  }
}
