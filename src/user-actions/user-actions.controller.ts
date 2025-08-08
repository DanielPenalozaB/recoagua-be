import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserActionsService } from './user-actions.service';
import { CreateUserActionDto } from './dto/create-user-action.dto';
import { UpdateUserActionDto } from './dto/update-user-action.dto';

@Controller('user-actions')
export class UserActionsController {
  constructor(private readonly userActionsService: UserActionsService) {}

  @Post()
  create(@Body() createUserActionDto: CreateUserActionDto) {
    return this.userActionsService.create(createUserActionDto);
  }

  @Get()
  findAll() {
    return this.userActionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userActionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserActionDto: UpdateUserActionDto) {
    return this.userActionsService.update(+id, updateUserActionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userActionsService.remove(+id);
  }
}
