import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { AddExerciseToWorkoutDto } from './dto/add-exercise.dto';
import { AddSetDto } from './dto/add-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { QueryWorkoutsDto } from './dto/query-workouts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  // ── Workouts ──────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() u: AuthenticatedUser, @Body() dto: CreateWorkoutDto) {
    return this.workoutsService.create(u.id, dto);
  }

  @Get()
  findAll(@CurrentUser() u: AuthenticatedUser, @Query() q: QueryWorkoutsDto) {
    return this.workoutsService.findAll(u.id, q);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.workoutsService.findOne(id, u.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() u: AuthenticatedUser,
    @Body() dto: UpdateWorkoutDto,
  ) {
    return this.workoutsService.update(id, u.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.workoutsService.remove(id, u.id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(@Param('id') id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.workoutsService.complete(id, u.id);
  }

  @Get(':id/previous')
  getPrevious(@Param('id') id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.workoutsService.getPreviousPerformance(id, u.id);
  }

  // ── Exercises ─────────────────────────────────────────────────────────

  @Post(':id/exercises')
  @HttpCode(HttpStatus.CREATED)
  addExercise(
    @Param('id') id: string,
    @CurrentUser() u: AuthenticatedUser,
    @Body() dto: AddExerciseToWorkoutDto,
  ) {
    return this.workoutsService.addExercise(id, u.id, dto);
  }

  @Delete(':id/exercises/:weId')
  @HttpCode(HttpStatus.OK)
  removeExercise(
    @Param('id') id: string,
    @Param('weId') weId: string,
    @CurrentUser() u: AuthenticatedUser,
  ) {
    return this.workoutsService.removeExercise(id, weId, u.id);
  }

  // ── Sets ─────────────────────────────────────────────────────────────

  @Post(':id/exercises/:weId/sets')
  @HttpCode(HttpStatus.CREATED)
  addSet(
    @Param('id') id: string,
    @Param('weId') weId: string,
    @CurrentUser() u: AuthenticatedUser,
    @Body() dto: AddSetDto,
  ) {
    return this.workoutsService.addSet(id, weId, u.id, dto);
  }

  @Patch(':id/exercises/:weId/sets/:setId')
  updateSet(
    @Param('id') id: string,
    @Param('setId') setId: string,
    @CurrentUser() u: AuthenticatedUser,
    @Body() dto: UpdateSetDto,
  ) {
    return this.workoutsService.updateSet(id, setId, u.id, dto);
  }

  @Delete(':id/exercises/:weId/sets/:setId')
  @HttpCode(HttpStatus.OK)
  removeSet(
    @Param('id') id: string,
    @Param('setId') setId: string,
    @CurrentUser() u: AuthenticatedUser,
  ) {
    return this.workoutsService.removeSet(id, setId, u.id);
  }
}
