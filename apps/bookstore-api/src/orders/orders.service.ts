import { BooksService } from './../books/books.service';
import { UsersService } from './../users/users.service';
import { UserResponseDto } from './../users/dto/responses/user.response.dto';
import { AllowedSortFields, SortOrder, Statuses } from '../common/enums';
import { E_INSUFFCIENT_FUNDS, E_ORDER_NOT_FOUND } from '../common/exceptions';
import { DEFAULT_LIMIT } from '../common/constants';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInputDto } from './dto/inputs/create-order.input.dto';
import { OrderResponseDto } from './dto/responses/order.response.dto';
import { UpdateOrderInputDto } from './dto/inputs/update-order.input.dto';
import { FindOrdersArgsDto } from './dto/args/find-orders.args.dto';
import { OrdersResponseDto } from './dto/responses/orders.response.dto';


@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly usersService: UsersService,
        private readonly booksService: BooksService
    ) {}

    async createOrder(data: CreateOrderInputDto, currentUser: UserResponseDto): Promise<OrderResponseDto> {
        const {  bookId } = data;

        // Fetch book
        const book = await this.booksService.findOne(bookId);

        if (!book) throw new NotFoundException(E_ORDER_NOT_FOUND);

        // Check if user has enough points to order the book
        if (currentUser.points < book.points)
            throw new BadRequestException(E_INSUFFCIENT_FUNDS);

        // Deduct points from user
        const updatedUser = await this.usersService.deductPoints(currentUser.id, book.points);

        // Create the order
        const order = await this.prisma.order.create({
        data: {
            user: { connect: { id: currentUser.id } },
            book: { connect: { id: bookId } },
            status: Statuses.PENDING
        },
        include: {
            user: true,
            book: true
        }
        });

        return this._transformOrderData(order);
    }

    async updateOrder(id: number, data: UpdateOrderInputDto): Promise<OrderResponseDto> {
        const existingOrder = await this.findOne(id);
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: { status: data.status }
        });
        return existingOrder;
    }
    
    async deleteOrder(id: number): Promise<OrderResponseDto> {
        const existingOrder = await this.findOne(id);
        await this.prisma.book.delete({ where: { id } });
        return existingOrder;
    }

    async findAll(args: FindOrdersArgsDto, currentUser: UserResponseDto): Promise<OrdersResponseDto> {
        const {
            limit,
            offset,
            sortField,
            sortOrder,
            userId, 
            bookId,
            status
        } = args;
    
        // The where clause
        const where = {
            ...(userId && { userId: parseInt(userId) }),
            ...(bookId && { bookId: parseInt(bookId) }),
            ...(status && { status })
        };
    
        const orders = await this.prisma.order.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: {
                [sortField || AllowedSortFields.CREATED_AT]: sortOrder || SortOrder.DESC
            },
            include: {
                user: true,
                book: {
                    include: {
                        tags: true
                    }
                }
            }
        });
    
        const count = await this.prisma.order.count({ where });
    
        // Transform the data for the response
        const transformedOrders = orders.map(order => {
            return this._transformOrderData(order);
        });
    
        // Constructing the final response
        return {
            data: transformedOrders,
            metadata: {
                total: count,
                offset: offset || 0,
                limit: limit || DEFAULT_LIMIT
            }
        };
    }

    async findOne(id: number): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findUnique({
            where: { id },
            select: {
                id: true,
                userId: true,
                bookId: true,
                status: true,
                user: true,
                createdAt: true,
                updatedAt: true,
                book: {
                    include: {
                        tags: true
                    }
                }
            }
        });

        if (!order) {
            throw new NotFoundException(E_ORDER_NOT_FOUND);
        }
        return this._transformOrderData(order);
    }

    private _transformOrderData(order): OrderResponseDto {
        return {
            id: order.id,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            user: {
                id: order.user.id,
                name: order.user.name,
                email: order.user.email,
                points: order.user.points,
                createdAt: order.user.createdAt,
                updatedAt: order.user.updatedAt
            },
            book: {
                id: order.book.id,
                title: order.book.title,
                writer: order.book.writer,
                coverImage: order.book.coverImage,
                points: order.book.points,
                createdAt: order.book.createdAt,
                updatedAt: order.book.updatedAt,
                tags: order.book.tags.map(tag => tag.name)
            }
        };
    }
}