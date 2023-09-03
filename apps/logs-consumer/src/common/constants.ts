export const APP_NAME = "Logs Consumer";
export const APP_DESCRIPTION = "Consumes the logs served by RabbitMQ and saved them to a file";
export const APP_VERSION = "1.0.0";

//  RabbitMQ
export const DEFAULT_RABBITMQ_PORT = '5672';
export const DEFAULT_RABBITMQ_HOST = 'localhost' 
export const DEFAULT_RABBITMQ_QUEUE_NAME = 'logs_queue';
export const DEFAULT_RABBITMQ_SERVICE_NAME = 'RABBITMQ_SERVICE';
export const DEFAULT_RABBITMQ_URL = 'amqp://localhost:5672'; //  Testing
