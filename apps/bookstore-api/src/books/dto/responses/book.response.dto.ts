import { ApiProperty } from '@nestjs/swagger';

export class BookResponseDto {
  @ApiProperty({ description: 'Unique ID of the book' })
  id: number;

  @ApiProperty({ description: 'Title of the book' })
  title: string;

  @ApiProperty({ description: 'Writer of the book' })
  writer: string;

  @ApiProperty({ description: 'Image url of the book cover' })
  coverImage: string;

  @ApiProperty({ description: 'Points (price) of the book' })
  points: number;

  @ApiProperty({ type: [String], description: 'Tags to which the book belongs' })
  tags: string[];
}
