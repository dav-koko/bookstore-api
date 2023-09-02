import { Controller, Get, Query, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/responses/user.response.dto';
import { UsersResponseDto } from './dto/responses/users.response.dto';
import { FindUsersArgsDto } from './dto/args/find-users.args.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiQuery({ type: FindUsersArgsDto, required: false })
    @ApiOkResponse({ type: UsersResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    async findAll(@Query() args: FindUsersArgsDto): Promise<UsersResponseDto> {
        return await this.usersService.findAll(args);
    }

    @Get(':id')
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiOkResponse({ type: UserResponseDto })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    async findOne(@Param('id') id: number): Promise<UserResponseDto> {
        return await this.usersService.findOne(id);
    }
}
