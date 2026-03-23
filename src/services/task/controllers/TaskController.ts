import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { TaskService } from "../services/TaskService";
import { JwtAuthGuard } from "src/services/auth/guards/JwtAuthGuard";
import { CreateTaskDto } from "../dto/CreateTaskDto";

type AuthRequest = Request & { user: { id: string, email: string; name: string } };

@Controller("workspaces/:workspaceId/tasks")
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    createTask(
        @Param("workspaceId") workspaceId: string,
        @Req() req: AuthRequest,
        @Body() dto: CreateTaskDto,
    ) {
        return this.taskService.createTask(workspaceId, req.user.id, dto);
    }
}