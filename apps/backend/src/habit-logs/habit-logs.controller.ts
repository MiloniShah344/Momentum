import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HabitLogsService } from './habit-logs.service';
import { ToggleHabitDto } from './dto/toggle-habit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('habit-logs')
@UseGuards(JwtAuthGuard)
export class HabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  toggle(@CurrentUser() user: AuthenticatedUser, @Body() dto: ToggleHabitDto) {
    return this.habitLogsService.toggle(user.id, dto);
  }
}
