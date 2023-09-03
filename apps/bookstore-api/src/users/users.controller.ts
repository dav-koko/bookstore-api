import { UserAuthGuard } from './../auth/user-auth.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserInputDto } from './dto/inputs/create-user.input.dto';
import { UpdateUserInputDto } from './dto/inputs/update-user.input.dto';
import { FindUsersArgsDto } from './dto/args/find-users.args.dto';
import { UserResponseDto } from './dto/responses/user.response.dto';
import { UsersResponseDto } from './dto/responses/users.response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully', type: UserResponseDto })
    async create(@Body() createUserDto: CreateUserInputDto): Promise<UserResponseDto> {
        return this.usersService.createUser(createUserDto);
    }

    @UseGuards(UserAuthGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Update user details' })
    @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully', type: UserResponseDto })
    async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserInputDto): Promise<UserResponseDto> {
        return this.usersService.updateUser(id, updateUserDto);
    }

    @UseGuards(UserAuthGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully', type: UserResponseDto })
    async delete(@Param('id') id: number): Promise<UserResponseDto> {
    const deletedUser = await this.usersService.deleteUser(id);
        return deletedUser;
    }

    @UseGuards(UserAuthGuard)
    @Get()
    @ApiOperation({ summary: 'Retrieve a list of users' })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of users fetched successfully', type: UsersResponseDto })
    @ApiQuery({ type: FindUsersArgsDto, required: false })
    async findAll(@Query() findUsersArgsDto: FindUsersArgsDto): Promise<UsersResponseDto> {
        return this.usersService.findAll(findUsersArgsDto);
    }

    @UseGuards(UserAuthGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a user by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'User fetched successfully', type: UserResponseDto })
    async findOne(@Param('id') id: number): Promise<UserResponseDto> {
        return this.usersService.findOne(id);
    }
}
