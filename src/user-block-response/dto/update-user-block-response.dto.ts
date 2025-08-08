import { PartialType } from '@nestjs/swagger';
import { CreateUserBlockResponseDto } from './create-user-block-response.dto';

export class UpdateUserBlockResponseDto extends PartialType(CreateUserBlockResponseDto) {}
