import { FindArgsDto } from '../../../common/dto/args/find.args.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindBooksArgsDto extends FindArgsDto {
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({type: [String], required: false, description: 'Filter books by exact tags match.' })
  tags?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Filter books by exact writer match.' })
  writer?: string;
}
