import { IsEnum, IsInt, IsOptional, IsString, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AllowedSortFields, SortOrder } from './../../enums';
import { DEFAULT_LIMIT, DEFAULT_OFFSET, DEFAULT_SORT_FIELD } from './../../constants';

export class FindArgsDto {
  @IsInt()
  @Max(100)
  @IsOptional()
  @ApiProperty({ required: false, default: DEFAULT_LIMIT })
  limit?: number;

  @IsInt()
  @IsOptional()
  @ApiProperty({ required: false, default: DEFAULT_OFFSET })
  offset?: number;

  @IsEnum(AllowedSortFields)
  @IsOptional()
  @ApiProperty({ enum: AllowedSortFields, required: false, default: DEFAULT_SORT_FIELD })
  sortField?: AllowedSortFields;

  @IsEnum(SortOrder)
  @IsOptional()
  @ApiProperty({ enum: SortOrder, required: false, default: SortOrder.DESC })
  sortOrder?: SortOrder;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'The search query string.' })
  searchQuery?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'The field to apply the search query against.' })
  searchField?: string;
}
