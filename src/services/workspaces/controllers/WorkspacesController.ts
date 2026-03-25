import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { WorkspacesService } from "../services/WorkspacesService";
import { JwtAuthGuard } from "src/services/auth/guards/JwtAuthGuard";
import { CreateWorkspaceDto } from "../dto/CreateWorkspaceDto";
import { JoinWorkspaceDto } from "../dto/JoinWorkspaceDto";
import { UpdateWorkspaceDto } from "../dto/UpdateWorkspaceDto";

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

    @UseGuards(JwtAuthGuard)
    @Get()
    findManyWorkspaces(@Req() req: AuthRequest) {
        return this.workspacesService.getMyWorkspaces(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":workspaceId/members")
    findWorkspaceMembers(@Param("workspaceId") workspaceId: string, @Req() req: AuthRequest) {
        return this.workspacesService.getWorkspaceMembers(workspaceId, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":workspaceId")
    updateWorkspace(
        @Param("workspaceId") workspaceId: string,
        @Req() req: AuthRequest,
        @Body() dto: UpdateWorkspaceDto
    ) {
        return this.workspacesService.updateWorkspace(workspaceId, req.user.id, dto);
    }
}