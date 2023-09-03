import { Controller, Get } from '@nestjs/common';
import { LogsConsumerService } from './logs-consumer.service';

@Controller()
export class LogsConsumerController {
  constructor(private readonly logsConsumerService: LogsConsumerService) {}

  @Get()
  getHello(): string {
    return 'Hi, I am the consumer';
  }
}
