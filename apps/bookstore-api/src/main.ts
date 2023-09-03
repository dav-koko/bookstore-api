import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { rateLimit } from 'express-rate-limit';
import { E_TOO_MANY_REQUESTS } from './common/exceptions';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from './common/constants';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: false, // Origin is set to false to allow requests from any origin just as we test the api, this will change in production
  });

  //  Limits the number of requests from the same IP in a period of time. : 100/10min
  app.use(rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    message: { "message": E_TOO_MANY_REQUESTS, "statusCode": 403, }
  }));

  //  Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  //  Swagger setup
  const config = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(APP_DESCRIPTION)
    .setVersion(APP_VERSION)
    .addBearerAuth() // Use Bearer Authentication
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  //  Start listening
  await app.listen(process.env.PORT ? parseInt(process.env.PORT) : 3000);
}
bootstrap();
