import { Module } from '@nestjs/common';
import { BooksModule } from './../books/books.module';
import { UsersModule } from './../users/users.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [UsersModule, BooksModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
