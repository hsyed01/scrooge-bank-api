import { Controller, Post, Delete, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AccountService } from './account.service';

@Controller('account')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('open/:userId')
  @Roles('USER')
  openAccount(@Param('userId') userId: string) {
    return this.accountService.openAccount(+userId);
  }

  @Delete('close/:userId')
  @Roles('USER')
  closeAccount(@Param('userId') userId: string) {
    return this.accountService.closeAccount(+userId);
  }
}
