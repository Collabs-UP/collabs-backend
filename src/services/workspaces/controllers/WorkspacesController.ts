import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { WorkspacesService } from "../services/WorkspacesService";
import { JwtAuthGuard } from "src/services/auth/guards/JwtAuthGuard";
import { CreateWorkspaceDto } from "../dto/CreateWorkspaceDto";
import { JoinWorkspaceDto } from "../dto/JoinWorkspaceDto";

type AuthRequest = Request & { user: { id: string; email: string; name: string}};

@Controller('workspaces')
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req: AuthRequest, @Body() dto: CreateWorkspaceDto) {
        return this.workspacesService.createWorkspace(req.user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('join')
    join(@Req() req: AuthRequest, @Body() dto: JoinWorkspaceDto) {
        return this.workspacesService.joinWorkspace(req.user.id, dto)
    }
}