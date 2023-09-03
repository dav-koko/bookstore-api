import { IsString, IsNumber, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookInputDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Title of the book' })
    readonly title: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Writer of the book' })
    readonly writer: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Image url of the book cover' })
    readonly coverImage: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: 'Points(price) of the book' })
    readonly points: number;

    @IsArray()
    @IsString({ each: true })
    @ApiProperty({ type: [String], description: 'Tags to which the belongs' })
    tags: string[];
}

