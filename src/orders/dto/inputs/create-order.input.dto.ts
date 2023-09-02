import { IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderInputDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: 'Id of the book that is being ordered' })
    bookId: number;

    //  We are not taking the user's Id because we will get the user's Id from 
    //  thier accessToken using the @currentUser decorator
}

