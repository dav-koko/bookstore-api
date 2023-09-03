import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { LoggerService } from './logger/logger.service';
import { DEFAULT_RABBITMQ_QUEUE_NAME, DEFAULT_RABBITMQ_SERVICE_NAME, DEFAULT_RABBITMQ_URL } from './common/constants';
import { LoggerMiddleware } from './logger/middleware/logger.middleware';
import { LoggerModule } from './logger/logger.module';

//  In the AppModule class bellow, the LoggerMiddleware middleware is applied to all routes
//  so that every incoming request to any route will first pass through it and
//  its purpose is to log all incoming requests through RabbitMQ

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    BooksModule,
    LoggerModule,

    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),

    // RabbitMQ configuration
    ClientsModule.registerAsync([{
        name: DEFAULT_RABBITMQ_SERVICE_NAME,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
            return {
                transport: Transport.RMQ,
                options: {
                    urls: [configService.get<string>('RABBITMQ_URL', DEFAULT_RABBITMQ_URL)],
                    queue: configService.get<string>('RABBITMQ_QUEUE_NAME', DEFAULT_RABBITMQ_QUEUE_NAME),
                    queueOptions: {
                        durable: true
                    },
                }
            }
        }
    }]),
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
        .apply(LoggerMiddleware)
        .forRoutes('*'); // The middleware is applied to all routes so that we can log all the requests.
    }
}
