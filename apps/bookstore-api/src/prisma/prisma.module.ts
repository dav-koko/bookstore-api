import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // The module is global-scoped, so that we can access it from everywhere
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
