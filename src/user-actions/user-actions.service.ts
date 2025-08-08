import { Injectable } from '@nestjs/common';
import { CreateUserActionDto } from './dto/create-user-action.dto';
import { UpdateUserActionDto } from './dto/update-user-action.dto';

@Injectable()
export class UserActionsService {
  create(createUserActionDto: CreateUserActionDto) {
    return 'This action adds a new userAction';
  }

  findAll() {
    return `This action returns all userActions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userAction`;
  }

  update(id: number, updateUserActionDto: UpdateUserActionDto) {
    return `This action updates a #${id} userAction`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAction`;
  }
}
