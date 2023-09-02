import { ApiProperty } from '@nestjs/swagger';
import { ResultsMetadataResponseDto } from '../../../common/dto/responses/results-metadata.response.dto';
import { OrderResponseDto } from './order.response.dto';

export class OrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto], description: 'List of orders' })
  data: OrderResponseDto[];

  @ApiProperty({ type: ResultsMetadataResponseDto, description: 'Metadata about the results' })
  metadata: ResultsMetadataResponseDto;
}
