import { ApiProperty } from '@nestjs/swagger';

export class ResultsMetadataResponseDto {
  @ApiProperty({ description: 'Total number of records' })
  total: number;

  @ApiProperty({ description: 'Current offset for pagination' })
  offset: number;

  @ApiProperty({ description: 'Number of records per page' })
  limit: number;
}
