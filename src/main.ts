import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { rateLimit } from 'express-rate-limit';
import { E_TOO_MANY_REQUESTS } from './common/exceptions';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from './common/constants';

async function bootstrap() {
  //  App Instantiation
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: false, // I have set origin to false to allow requests from any origin just as we test the api, this will change in production
  });

  //  Limits the number of requests from the same IP in a period of time.
  app.use(rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
    skipSuccessfulRequests: false, // The counting will skip all successful requests and just count the errors. Instead of removing rate-limiting, it's better to set this to true to limit the number of times a request fails. Can help prevent against brute-force attacks
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
    .addBasicAuth({ type: 'apiKey', name: 'accessToken', in: 'query' }) // Use basic authentication for admin access
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  //  Start listening
  await app.listen(process.env.PORT ? parseInt(process.env.PORT) : 3000);
}
bootstrap();
