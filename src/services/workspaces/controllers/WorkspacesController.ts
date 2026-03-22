import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { WorkspacesService } from "../services/WorkspacesService";
import { JwtAuthGuard } from "src/services/auth/guards/JwtAuthGuard";
import { CreateWokspaceDto } from "../dto/CreateWorkspaceDto";

type AuthRequest = Request & { user: { id: string; email: string; name: string}};

@Controller('workspaces')
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req: AuthRequest, @Body() dto: CreateWokspaceDto) {
        return this.workspacesService.createWorkspace(req.user.id, dto);
    }
}