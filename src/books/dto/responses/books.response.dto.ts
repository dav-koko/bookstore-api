import { ApiProperty } from '@nestjs/swagger';
import { ResultsMetadataResponseDto } from '../../../common/dto/responses/results-metadata.response.dto';
import { BookResponseDto } from './book.response.dto';

export class BooksResponseDto {
  @ApiProperty({ type: [BookResponseDto], description: 'List of books' })
  data: BookResponseDto[];

  @ApiProperty({ type: ResultsMetadataResponseDto, description: 'Metadata about the results' })
  metadata: ResultsMetadataResponseDto;
}
