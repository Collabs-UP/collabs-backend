import { Module } from '@nestjs/common';
import { TaskController } from './controllers/TaskController';
import { TaskService } from './services/TaskService';
import { TaskStatusController } from './controllers/TaskStatusController';

@Module({
  controllers: [TaskController, TaskStatusController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
