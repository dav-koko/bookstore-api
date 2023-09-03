import { FindArgsDto } from './../../../common/dto/args/find.args.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindUsersArgsDto extends FindArgsDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Filter users by exact email match' })
  email?: string;
}
