import { Injectable } from '@nestjs/common';
import { Ctx, RmqContext, EventPattern } from '@nestjs/microservices';
import { FileUtility } from './utilities/file.utility';

@Injectable()
export class LogsConsumerService {

  @EventPattern('log_data')
  async consumeLogData(@Ctx() context: RmqContext, data: any): Promise<void> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await FileUtility.appendToFile('logs.txt', data); // Save the data to file
      channel.ack(originalMsg); // Acknowledge the message

    } catch (e) {
      channel.reject(originalMsg);
    }
  }
}

