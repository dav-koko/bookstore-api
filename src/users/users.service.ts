import { E_USER_EMAIL_TAKEN, E_USER_NOT_FOUND } from './../common/exceptions';
import { DEFAULT_LIMIT, INITIAL_POINTS } from './../common/constants';
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInputDto } from './dto/inputs/create-user.input.dto';
import { UserResponseDto } from './dto/responses/user.response.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserInputDto } from './dto/inputs/update-user.input.dto';
import { FindUsersArgsDto } from './dto/args/find-users.args.dto';
import { UsersResponseDto } from './dto/responses/users.response.dto';
import { User } from '../../prisma/node_modules/@prisma/client';


@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async createUser(data: CreateUserInputDto): Promise<UserResponseDto> {
        //  Check if the email already exists
        if (await this.emailExists(data.email)) {
            throw new ConflictException(E_USER_EMAIL_TAKEN);
        }

        //  Hash the password
        const hashedPassword = await this.hashPassword(data.password);

        const user = await this.prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            points: INITIAL_POINTS  // Every new user gets 100 points.
        }
        });

        const userDto: UserResponseDto = {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points
        };

        return userDto;
    }

    async updateUser(id: number, data: UpdateUserInputDto): Promise<UserResponseDto> {
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
            },
        });
        if (!user) throw new NotFoundException(E_USER_NOT_FOUND);
    
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points
        };
    }
    
    async deleteUser(id: number): Promise<UserResponseDto> {
        const user = await this.prisma.user.delete({ where: { id } });
        if (!user) throw new NotFoundException(E_USER_NOT_FOUND);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points,
        };
    }
    
    async deductPoints(userId: number, points: number): Promise<UserResponseDto> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                points: {
                    decrement: points,
                },
            },
        });
    
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points,
        };
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

        // The where clause for Prisma
        let where = {};
        if (email) {
            where['email'] = email;
        }
        
        // It defaults to name search if searchField is not provided
        if (searchQuery) {
            if (searchField) {
                where[searchField] = { contains: searchQuery };
            } else {
                where['name'] = { contains: searchQuery };
            }
        }

        // Fetch the users
        const users = await this.prisma.user.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: {
                [sortField || 'createdAt']: sortOrder || 'desc'
            }
        });

        // Fetch total users count for pagination metadata
        const count = await this.prisma.user.count({ where });

        // Convert the Prisma response to the desired DTO
        const userDtos: UserResponseDto[] = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points
        }));

        // Constructing the final response
        return {
            data: userDtos,
            metadata: {
                total: count,
                offset: offset || 0,
                limit: limit || DEFAULT_LIMIT // Ensure you have set DEFAULT_LIMIT constant at the top
            }
        };
    }

    async findOne(userId: number): Promise<UserResponseDto | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
    
        if (!user) return null;
    
        const userDto: UserResponseDto = {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points,
        };
    
        return userDto;
    }

    async findOneByField(field: keyof User, value: any): Promise<UserResponseDto | null> {
        if (!['email'].includes(field as string)) {  // Adjust the array to include other unique fields if necessary.
            throw new BadRequestException('Invalid field.');
        }
    
        const user: User = await this.prisma.user.findUnique({
            where: { [field]: value },
        });
    
        if (!user) return null;
    
        const userDto: UserResponseDto = {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points,
        };
    
        return userDto;
    }
    
    
    
    private async hashPassword(password: string): Promise<string> {
        const hashSalt = parseInt(process.env.PASSWORD_HASH_SALT || '10', 10);
        return bcrypt.hash(password, hashSalt);
    }

    private async emailExists(email: string): Promise<boolean> {
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        return !!existingUser;
    }

}
