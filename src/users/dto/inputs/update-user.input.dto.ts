import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserInputDto } from './create-user.input.dto';

export class UpdateUserInputDto extends PartialType(OmitType(CreateUserInputDto, ['password'] as const)) {}