import { UserResponseDto } from './../../../users/dto/responses/user.response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectionResponseDto {
  @ApiProperty({ type: UserResponseDto, description: 'User response dto' })
  user: UserResponseDto;

  @ApiProperty({ description: 'Access token of the signed-in user' })
  accessToken: string;
}
