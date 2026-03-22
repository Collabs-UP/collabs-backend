import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateWokspaceDto } from "../dto/CreateWorkspaceDto";
import { WorkspaceRole } from "@prisma/client";

@Injectable()
export class WorkspacesService {
    constructor(private readonly prisma: PrismaService) {}

    private async generateAccessCode(): Promise<string> {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        for (let i = 0; i < 10; i++) {
            const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            const exists = await this.prisma.workspace.findUnique({ where: { accessCode: code } });
            if (!exists) return code;
        }
        throw new Error('Could not generate unique access code');
    }

    async createWorkspace(userId: string, dto: CreateWokspaceDto) {
        const accessCode = await this.generateAccessCode();

        const workspace = await this.prisma.$transaction(async (tx) => {
            const created = await tx.workspace.create({
                data: {
                    ownerId: userId,
                    projectName: dto.projectName,
                    description: dto.description,
                    accessCode,
                },
            });

            await tx.member.create({
                data: {
                    userId,
                    workspaceId: created.id,
                    role: WorkspaceRole.OWNER,
                },
            });

            return created;
        });

        return {
            id: workspace.id,
            projectName: workspace.projectName,
            description: workspace.description,
            accessCode: workspace.accessCode,
            role: 'OWNER',
            createdAt: workspace.creationDate,
        };
    }
}