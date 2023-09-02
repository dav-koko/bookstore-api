import { ApiProperty } from '@nestjs/swagger';
import { ResultsMetadataResponseDto } from './results-metadata.response.dto';

export class SetOfResponseDto<T> {
  @ApiProperty({ description: 'List of items' })
  data: T[];

  @ApiProperty({ description: 'Metadata about the results' })
  metadata: ResultsMetadataResponseDto;
}
