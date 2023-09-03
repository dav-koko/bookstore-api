import { UserResponseDto } from './../users/dto/responses/user.response.dto';
import { CurrentUser } from './../auth/current-user.decorator';
import { UserAuthGuard } from '../auth/user-auth.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateOrderInputDto } from './dto/inputs/create-order.input.dto';
import { UpdateOrderInputDto } from './dto/inputs/update-order.input.dto';
import { OrderResponseDto } from './dto/responses/order.response.dto';
import { OrdersResponseDto } from './dto/responses/orders.response.dto';
import { OrdersService } from './orders.service';
import { FindOrdersArgsDto } from './dto/args/find-orders.args.dto';

@UseGuards(UserAuthGuard) // Normally we shall privileges/roles on who can can do what.
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @ApiOperation({ summary: 'Register a new order' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Order registered successfully', type: OrderResponseDto })
    async create(@Body() createOrderDto: CreateOrderInputDto, @CurrentUser() currentUser: UserResponseDto): Promise<OrderResponseDto> {
        return this.ordersService.createOrder(createOrderDto, currentUser);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update order details' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Order updated successfully', type: OrderResponseDto })
    async update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderInputDto): Promise<OrderResponseDto> {
        return this.ordersService.updateOrder(id, updateOrderDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a order by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Order deleted successfully', type: OrderResponseDto })
    async delete(@Param('id') id: number): Promise<OrderResponseDto> {
    const deletedOrder = await this.ordersService.deleteOrder(id);
        return deletedOrder;
    }

    @Get()
    @ApiOperation({ summary: 'Retrieve a list of orders' })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of orders fetched successfully', type: OrdersResponseDto })
    @ApiQuery({ type: FindOrdersArgsDto, required: false })
    async findAll(@Query() findOrdersArgsDto: FindOrdersArgsDto, @CurrentUser() currentUser: UserResponseDto): Promise<OrdersResponseDto> {
        return this.ordersService.findAll(findOrdersArgsDto, currentUser);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a order by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Order fetched successfully', type: OrderResponseDto })
    async findOne(@Param('id') id: number): Promise<OrderResponseDto> {
        return this.ordersService.findOne(id);
    }
}
