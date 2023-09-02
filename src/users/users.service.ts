import { AllowedSortFields, SortOrder } from './../common/enums';
import { E_USER_EMAIL_TAKEN, E_USER_NOT_FOUND } from './../common/exceptions';
import { DEFAULT_LIMIT, INITIAL_POINTS } from './../common/constants';
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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
                points: INITIAL_POINTS  // Every new user gets 100 points.
            },
            select: {
                id: true,
                name: true,
                email: true,
                points: true
            }
        });
    }

    async updateUser(id: number, data: UpdateUserInputDto): Promise<UserResponseDto> {
        const user = await this.prisma.user.update({
            where: { id },
            data: { ...data },
            select: {
                id: true,
                name: true,
                email: true,
                points: true
            }
        });
        if (!user) throw new NotFoundException(E_USER_NOT_FOUND);
    
        return user;
    }
    
    async deleteUser(id: number): Promise<UserResponseDto> {
        const user = await this.prisma.user.delete({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                points: true,
            }
        });
        if (!user) throw new NotFoundException(E_USER_NOT_FOUND);

        return user;
    }
    
    async deductPoints(userId: number, points: number): Promise<UserResponseDto> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                points: {
                    decrement: points,
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                points: true,
            },
        });
        if (!user) throw new NotFoundException(E_USER_NOT_FOUND);
    
        return user;
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
                [sortField || AllowedSortFields.POINTS]: sortOrder || SortOrder.DESC
            },
            select: {
                id: true,
                name: true,
                email: true,
                points: true,
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

    async findOne(id: number): Promise<UserResponseDto | null> {
        return await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                points: true,
            }
        });
    }

    //full user for login - done this to keep it simply
    async findOneForLogin(email: string): Promise<User> {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }
    
    private async _hashPassword(password: string): Promise<string> {
        const hashSalt = parseInt(process.env.PASSWORD_HASH_SALT || '10', 10);
        return bcrypt.hash(password, hashSalt);
    }

    private async _emailExists(email: string): Promise<boolean> {
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        return !!existingUser;
    }

}