import { Statuses } from './../../../common/enums';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderInputDto {
  @IsEnum(Statuses)
  @IsOptional()
  @ApiProperty({ enum: Statuses, required: false, default: Statuses.PENDING })
  status?: Statuses;
}