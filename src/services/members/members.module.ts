import { Module } from '@nestjs/common';
import { MembersController } from './controllers/members.controller';
import { MembersService } from './services/members.service';
import { PrismaModule } from '../../prisma/prisma.module'; 

@Module({
  imports: [PrismaModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}