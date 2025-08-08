import { PartialType } from '@nestjs/swagger';
import { CreateUserAnswerDetailDto } from './create-user-answer-detail.dto';

export class UpdateUserAnswerDetailDto extends PartialType(CreateUserAnswerDetailDto) {}
