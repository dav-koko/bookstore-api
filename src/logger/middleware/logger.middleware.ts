import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(private readonly loggerService: LoggerService) {}
    
    use(req: Request, res: Response, next: () => void): void {
        const { method, originalUrl, body } = req;
        this.loggerService.logData({ method, url: originalUrl, body });
        next();
    }
}