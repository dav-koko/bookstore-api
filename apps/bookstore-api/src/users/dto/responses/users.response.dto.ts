import { ApiProperty } from '@nestjs/swagger';
import { ResultsMetadataResponseDto } from './../../../common/dto/responses/results-metadata.response.dto';
import { UserResponseDto } from './user.response.dto';

export class UsersResponseDto {
  @ApiProperty({ type: [UserResponseDto], description: 'List of users' })
  data: UserResponseDto[];

  @ApiProperty({ type: ResultsMetadataResponseDto, description: 'Metadata about the results' })
  metadata: ResultsMetadataResponseDto;
}
