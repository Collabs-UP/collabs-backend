import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/services/auth/guards/JwtAuthGuard';
import { UpdateTaskStatusDto } from '../dto/UpdateTaskStatusDto';
import { TaskService } from '../services/TaskService';

type AuthRequest = Request & {
  user: { id: string; email: string; name: string };
};

@Controller('tasks')
export class TaskStatusController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Patch(':taskId/status')
  updateStatus(
    @Param('taskId') taskId: string,
    @Req() req: AuthRequest,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateTaskStatus(taskId, req.user.id, dto.status);
  }
}
