import { FindArgsDto } from '../../../common/dto/args/find.args.dto';
import { Statuses } from '../../../common/enums';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindOrdersArgsDto extends FindArgsDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Filter orders by exact user Id match' })
  userId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Filter orders by exact book Id match' })
  bookId?: string;
  
  @IsEnum(Statuses)
  @IsOptional()
  @ApiProperty({ enum: Statuses, required: false })
  status?: Statuses;
}
