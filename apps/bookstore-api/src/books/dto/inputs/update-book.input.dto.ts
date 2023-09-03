import { PartialType } from '@nestjs/swagger';
import { CreateBookInputDto } from './create-book.input.dto';

export class UpdateBookInputDto extends PartialType(CreateBookInputDto) {}