import { AllowedSortFields, SortOrder } from './../common/enums';
import { E_INSUFFCIENT_FUNDS, E_USER_EMAIL_TAKEN, E_USER_NOT_FOUND } from './../common/exceptions';
import { DEFAULT_LIMIT, DEFAULT_PASSWORD_HASH_SALT, INITIAL_POINTS } from './../common/constants';
import { Injectable, ConflictException, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInputDto } from './dto/inputs/create-user.input.dto';
import { UserResponseDto } from './dto/responses/user.response.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserInputDto } from './dto/inputs/update-user.input.dto';
import { FindUsersArgsDto } from './dto/args/find-users.args.dto';
import { UsersResponseDto } from './dto/responses/users.response.dto';
import { User } from '@prisma/client';


@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async createUser(data: CreateUserInputDto): Promise<UserResponseDto> {
        // Check if the email already exists
        if (await this._emailExists(data.email)) {
            throw new ConflictException(E_USER_EMAIL_TAKEN);
        }

        // Hash the password
        const hashedPassword = await this._hashPassword(data.password);

        // Create the user
        return await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
                points: INITIAL_POINTS  // Every new user gets 100 points.
            },
            select: {
                id: true,
                name: true,
                email: true,
                points: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    }

    async updateUser(id: number, data: UpdateUserInputDto): Promise<UserResponseDto> {
        const existingUser = await this.findOne(id);
        await this.prisma.user.update({
            where: { id },
            data: { ...data }
        });
        return existingUser;
    }
    
    async deleteUser(id: number): Promise<UserResponseDto> {
        const existingUser = await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return existingUser;
    }
    
    async deductPoints(id: number, points: number): Promise<UserResponseDto> {
        const existingUser = await this.findOne(id);
        if(existingUser.points < points || existingUser.points <= 0)
            throw new NotAcceptableException(E_INSUFFCIENT_FUNDS);
        await this.prisma.user.update({
            where: { id },
            data: {
                points: {
                    decrement: points
                },
            },
        });
        return existingUser;
    }

    //  I could combine the deductPoints and addPoints methods, but to keep the code readable, ...
    async addPoints(id: number, points: number): Promise<UserResponseDto> {
        const existingUser = await this.findOne(id);
        await this.prisma.user.update({
            where: { id },
            data: {
                points: {
                    increment: points
                },
            },
        });
        return existingUser;
    }
    

    async findAll(args: FindUsersArgsDto): Promise<UsersResponseDto> {
        const {
            limit, 
            offset, 
            sortField, 
            sortOrder, 
            email, 
            searchQuery, 
            searchField
        } = args;
    
        // The where clause
        const where = {
            ...(email && { email }),
            ...(searchQuery && searchField && { [searchField]: { contains: searchQuery } }),
            ...(searchQuery && !searchField && { name: { contains: searchQuery } })
        };
    
        // Fetch the users
        const users = await this.prisma.user.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: {
                [sortField || AllowedSortFields.CREATED_AT]: sortOrder || SortOrder.DESC
            },
            select: {
                id: true,
                name: true,
                email: true,
                points: true,
                createdAt: true,
                updatedAt: true
            }
        });
    
        // Fetch total users count for pagination metadata
        const count = await this.prisma.user.count({ where });
    
        // Constructing the final response
        return {
            data: users,
            metadata: {
                total: count,
                offset: offset || 0,
                limit: limit || DEFAULT_LIMIT
            }
        };
    }

    async findOne(id: number): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                points: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            throw new NotFoundException(E_USER_NOT_FOUND);
        }
        return user;
    }

    //full user for login - done this to keep things simply
    async findUserForAuthentication(email: string): Promise<User> {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }
    
    private async _hashPassword(password: string): Promise<string> {
        const hashSalt = parseInt(process.env.PASSWORD_HASH_SALT || DEFAULT_PASSWORD_HASH_SALT);
        return bcrypt.hash(password, hashSalt);
    }

    private async _emailExists(email: string): Promise<boolean> {
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        return !!existingUser;
    }

}