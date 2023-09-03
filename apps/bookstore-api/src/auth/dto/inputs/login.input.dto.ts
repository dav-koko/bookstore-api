import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginInputDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'Email address of the user' })
    readonly email: string;

    @IsString()
    @MinLength(8)
    @ApiProperty({ description: 'Password for the user, at least 8 characters' })
    readonly password: string;
}
