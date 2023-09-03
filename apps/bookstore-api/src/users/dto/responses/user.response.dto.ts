import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'Unique ID of the user' })
  id: number;

  @ApiProperty({ description: 'Name of the user' })
  name: string;

  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @ApiProperty({ description: 'Total points accumulated by the user' })
  points: number;

  @ApiProperty({ description: 'Date when the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the user was updated' })
  updatedAt: Date;
}
