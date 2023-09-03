import { BookResponseDto } from './../../../books/dto/responses/book.response.dto';
import { UserResponseDto } from './../../../users/dto/responses/user.response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class OrderResponseDto {
  @ApiProperty({ description: 'Unique ID of the order' })
  id: number;

  @ApiProperty({ type: UserResponseDto, description: 'User who placed the order' })
  user: UserResponseDto;

  @ApiProperty({ type: BookResponseDto, description: 'Book that was ordered' })
  book: BookResponseDto;

  @ApiProperty({ description: 'Status of the order' })
  status: string;

  @ApiProperty({ description: 'Date when the order was placed' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the order was placed' })
  updatedAt: Date;
}
