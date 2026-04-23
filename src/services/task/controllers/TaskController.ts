import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from '../services/TaskService';
import { JwtAuthGuard } from 'src/services/auth/guards/JwtAuthGuard';
import { CreateTaskDto } from '../dto/CreateTaskDto';
import { ListTaskDto } from '../dto/ListTasksDto';

type AuthRequest = Request & {
  user: { id: string; email: string; name: string };
};

@Controller('workspaces/:workspaceId/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createTask(
    @Param('workspaceId') workspaceId: string,
    @Req() req: AuthRequest,
    @Body() dto: CreateTaskDto,
  ) {
    return this.taskService.createTask(workspaceId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listTasks(
    @Param('workspaceId') workspaceId: string,
    @Req() req: AuthRequest,
    @Query() query: ListTaskDto,
  ) {
    return this.taskService.listTasks(workspaceId, req.user.id, query.status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':taskId')
  @HttpCode(HttpStatus.OK)
  async removeTask(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskService.removeTask(workspaceId, taskId);
  }
}
