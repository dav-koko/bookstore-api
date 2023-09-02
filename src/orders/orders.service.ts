import { BooksService } from './../books/books.service';
import { UsersService } from './../users/users.service';
import { UserResponseDto } from './../users/dto/responses/user.response.dto';
import { AllowedSortFields, SortOrder, Statuses } from '../common/enums';
import { E_BOOK_NOT_FOUND, E_INSUFFCIENT_FUNDS, E_ORDER_NOT_FOUND } from '../common/exceptions';
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

        return {
        id: order.id,
        user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            points: updatedUser.points
        },
        book: {
            id: book.id,
            title: book.title,
            writer: book.writer,
            coverImage: book.coverImage,
            points: book.points,
            tags: book.tags
        },
        status: order.status,
        orderDate: order.orderDate
        };
    }

    async updateOrder(id: number, data: UpdateOrderInputDto): Promise<OrderResponseDto> {
        const existingOrder = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                book: true
            }
        });
    
        if (!existingOrder) {
            throw new NotFoundException(E_ORDER_NOT_FOUND);
        }
    
        // If the order is being cancled and it wasn't already, refund the points
        if (data.status === Statuses.CANCELED && existingOrder.status !== Statuses.CANCELED) {
            await this.usersService.addPoints(existingOrder.userId, existingOrder.book.points)
        }
    
        // Update the order
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: { status: data.status },
            include: {
                user: true,
                book: {
                    include: {
                        tags: true
                    }
                }
            }
        });
    
        return {
            id: updatedOrder.id,
            user: {
                id: updatedOrder.user.id,
                name: updatedOrder.user.name,
                email: updatedOrder.user.email,
                points: updatedOrder.user.points
            },
            book: {
                id: updatedOrder.book.id,
                title: updatedOrder.book.title,
                writer: updatedOrder.book.writer,
                coverImage: updatedOrder.book.coverImage,
                points: updatedOrder.book.points,
                tags: updatedOrder.book.tags.map(tag => tag.name)
            },
            status: updatedOrder.status,
            orderDate: updatedOrder.orderDate
        };
    }
    
    async deleteOrder(id: number): Promise<OrderResponseDto> {
        const existingOrder = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                book: true
            }
        });
    
        if (!existingOrder) {
            throw new NotFoundException(E_ORDER_NOT_FOUND);
        }
    
        // If the order wasn't already canceled, refund the points
        if (existingOrder.status !== Statuses.PENDING)
            await this.usersService.addPoints(existingOrder.userId, existingOrder.book.points);
    
        // Delete the order
        const deletedOrder = await this.prisma.order.delete({
            where: { id },
            include: {
                user: true,
                book: {
                    include: {
                        tags: true
                    }
                }
            }
        });
    
        return {
            id: deletedOrder.id,
            user: {
                id: deletedOrder.user.id,
                name: deletedOrder.user.name,
                email: deletedOrder.user.email,
                points: deletedOrder.user.points
            },
            book: {
                id: deletedOrder.book.id,
                title: deletedOrder.book.title,
                writer: deletedOrder.book.writer,
                coverImage: deletedOrder.book.coverImage,
                points: deletedOrder.book.points,
                tags: deletedOrder.book.tags.map(tag => tag.name)
            },
            status: deletedOrder.status,
            orderDate: deletedOrder.orderDate
        };
    }

    async findAll(args: FindOrdersArgsDto): Promise<OrdersResponseDto> {
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
                [sortField || 'orderDate']: sortOrder || 'desc'
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
        const transformedOrders = orders.map(order => ({
            id: order.id,
            user: {
                id: order.user.id,
                name: order.user.name,
                email: order.user.email,
                points: order.user.points
            },
            book: {
                id: order.book.id,
                title: order.book.title,
                writer: order.book.writer,
                coverImage: order.book.coverImage,
                points: order.book.points,
                tags: order.book.tags.map(tag => tag.name)
            },
            status: order.status,
            orderDate: order.orderDate
        }));
    
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
                orderDate: true,
                user: true,
                book: {
                    include: {
                        tags: true
                    }
                }
            }
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return {
            id: order.id,
            status: order.status,
            orderDate: order.orderDate,
            user: {
                id: order.user.id,
                name: order.user.name,
                email: order.user.email,
                points: order.user.points
            },
            book: {
                id: order.book.id,
                title: order.book.title,
                writer: order.book.writer,
                coverImage: order.book.coverImage,
                points: order.book.points,
                tags: order.book.tags.map(tag => tag.name)
            }
        };
    }
}