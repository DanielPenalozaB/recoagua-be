import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserChallengesService } from './user-challenges.service';
import { CreateUserChallengeDto } from './dto/create-user-challenge.dto';
import { UpdateUserChallengeDto } from './dto/update-user-challenge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('User Challenges')
@ApiBearerAuth()
@Controller('user-challenges')
export class UserChallengesController {
  constructor(private readonly userChallengesService: UserChallengesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createUserChallengeDto: CreateUserChallengeDto, @Req() req) {
    return this.userChallengesService.create(req.user.id, createUserChallengeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req) {
    return this.userChallengesService.findAll(req.user.id);
  }

  @Post(':challengeId/complete')
  @UseGuards(JwtAuthGuard)
  complete(@Param('challengeId') challengeId: string, @Req() req) {
    const userId = req.user.id ?? req.user.sub;
    return this.userChallengesService.completeChallenge(userId, +challengeId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.userChallengesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserChallengeDto: UpdateUserChallengeDto) {
    return this.userChallengesService.update(+id, updateUserChallengeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.userChallengesService.remove(+id);
  }
}
