import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @Roles('USER', 'ADMIN')
  getById(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @Get()
  @Roles('ADMIN')
  allUsers() {
    return this.userService.findAll();
  }
}
