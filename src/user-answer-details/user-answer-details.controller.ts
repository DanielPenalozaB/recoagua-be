import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserAnswerDetailsService } from './user-answer-details.service';
import { CreateUserAnswerDetailDto } from './dto/create-user-answer-detail.dto';
import { UpdateUserAnswerDetailDto } from './dto/update-user-answer-detail.dto';

@Controller('user-answer-details')
export class UserAnswerDetailsController {
  constructor(private readonly userAnswerDetailsService: UserAnswerDetailsService) {}

  @Post()
  create(@Body() createUserAnswerDetailDto: CreateUserAnswerDetailDto) {
    return this.userAnswerDetailsService.create(createUserAnswerDetailDto);
  }

  @Get()
  findAll() {
    return this.userAnswerDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userAnswerDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserAnswerDetailDto: UpdateUserAnswerDetailDto) {
    return this.userAnswerDetailsService.update(+id, updateUserAnswerDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAnswerDetailsService.remove(+id);
  }
}
