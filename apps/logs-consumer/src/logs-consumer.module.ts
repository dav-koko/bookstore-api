import { Module } from '@nestjs/common';
import { LogsConsumerController } from './logs-consumer.controller';
import { LogsConsumerService } from './logs-consumer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [LogsConsumerController],
  providers: [LogsConsumerService],
})
export class LogsConsumerModule {}
