import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './services/auth/auth.module';
import { WorkspacesModule } from './services/workspaces/workspaces.module';
import { TaskModule } from './services/task/task.module';
import { UserModule } from './services/users/users.module';
import { MembersModule } from './services/members/members.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    TaskModule,
    UserModule,
    MembersModule
  ],
})
export class AppModule {}