import { Body, ClassSerializerInterceptor, Controller, Post, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiNotAcceptableResponse, ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { E_INCORRECT_EMAIL_OR_PASSWORD } from '../common/exceptions';
import { ConnectionResponseDto } from './dto/responses/connection.response.dto';
import { LoginInputDto } from './dto/inputs/login.input.dto';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Authenticate and login a user.' })
    @ApiOkResponse({ description: 'Login successful', type: ConnectionResponseDto })
    @ApiNotAcceptableResponse({ description: E_INCORRECT_EMAIL_OR_PASSWORD })
    async login(@Body() loginDto: LoginInputDto): Promise<ConnectionResponseDto> {
        return this.authService.login(loginDto);
    }
}