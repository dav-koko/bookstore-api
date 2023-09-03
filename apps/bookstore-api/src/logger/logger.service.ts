import { DEFAULT_RABBITMQ_QUEUE_NAME, DEFAULT_RABBITMQ_URL } from './../common/constants';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy, Transport, ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService {
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    this.client = this.initializeClient();
  }

  private initializeClient(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL', DEFAULT_RABBITMQ_URL)],
        queue: this.configService.get<string>('RABBITMQ_QUEUE_NAME', DEFAULT_RABBITMQ_QUEUE_NAME),
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  //  The log data to be sent to RabbitMQ.

  async logData(data: any): Promise<void> {
    try {
      //  Emit the data to RabbitMQ.
      await this.client.emit('log_data', data).toPromise();
      console.log(data)
    } catch (error) {
        console.error('Error Details:', error);
      // In a real-world scenario, you might want to handle this error more gracefully, 
      // perhaps sending it to another logging service, or retrying the message send.
      throw new InternalServerErrorException('Error sending log data to RabbitMQ', error.stack);
    }
  }
}
