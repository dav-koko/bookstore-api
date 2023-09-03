import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '../../../common/enums';

export class CreateUserInputDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Name of the user' })
    readonly name: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'Email address of the user' })
    readonly email: string;

    @IsString()
    @MinLength(8)
    @ApiProperty({ description: 'Password for the user, at least 8 characters' })
    readonly password: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'Role of the user' })
    readonly role: string;

    @IsEnum(Roles)
    @IsOptional()
    @ApiProperty({ enum: Roles, required: false, default: Roles.USER })
    sortOrder?: Roles;
}
