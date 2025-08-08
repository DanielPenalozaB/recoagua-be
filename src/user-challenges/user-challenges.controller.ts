import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserChallengesService } from './user-challenges.service';
import { CreateUserChallengeDto } from './dto/create-user-challenge.dto';
import { UpdateUserChallengeDto } from './dto/update-user-challenge.dto';

@Controller('user-challenges')
export class UserChallengesController {
  constructor(private readonly userChallengesService: UserChallengesService) {}

  @Post()
  create(@Body() createUserChallengeDto: CreateUserChallengeDto) {
    return this.userChallengesService.create(createUserChallengeDto);
  }

  @Get()
  findAll() {
    return this.userChallengesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userChallengesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserChallengeDto: UpdateUserChallengeDto) {
    return this.userChallengesService.update(+id, updateUserChallengeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userChallengesService.remove(+id);
  }
}
