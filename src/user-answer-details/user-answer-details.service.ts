import { Injectable } from '@nestjs/common';
import { CreateUserAnswerDetailDto } from './dto/create-user-answer-detail.dto';
import { UpdateUserAnswerDetailDto } from './dto/update-user-answer-detail.dto';

@Injectable()
export class UserAnswerDetailsService {
  create(createUserAnswerDetailDto: CreateUserAnswerDetailDto) {
    return 'This action adds a new userAnswerDetail';
  }

  findAll() {
    return `This action returns all userAnswerDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userAnswerDetail`;
  }

  update(id: number, updateUserAnswerDetailDto: UpdateUserAnswerDetailDto) {
    return `This action updates a #${id} userAnswerDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAnswerDetail`;
  }
}
