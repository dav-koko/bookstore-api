import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LogsConsumerModule } from './logs-consumer.module';
import { DEFAULT_RABBITMQ_QUEUE_NAME, DEFAULT_RABBITMQ_URL } from './common/constants';

async function bootstrap() {

  // RabbitMQ configuration - Setting up as a Microservice
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(LogsConsumerModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || DEFAULT_RABBITMQ_URL],
      queue: process.env.RABBITMQ_QUEUE_NAME || DEFAULT_RABBITMQ_QUEUE_NAME,
      noAck: false,
      queueOptions: {
        durable: true
      },
    },
  });

  app.listen();
}

bootstrap();
