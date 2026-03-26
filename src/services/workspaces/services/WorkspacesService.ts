import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateWorkspaceDto } from "../dto/CreateWorkspaceDto";
import { TaskStatus, WorkspaceRole } from "@prisma/client";
import { JoinWorkspaceDto } from "../dto/JoinWorkspaceDto";
import { UpdateWorkspaceDto } from "../dto/UpdateWorkspaceDto";

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

    async createWorkspace(userId: string, dto: CreateWorkspaceDto) {
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

    async updateWorkspace(workspaceId: string, userId: string, dto: UpdateWorkspaceDto) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, ownerId: true },
        });

        if(!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        if(workspace.ownerId !== userId) {
            throw new ForbiddenException("Only the owner can update workspace");
        }

        if (!dto.projectName && !dto.description) {
            throw new BadRequestException("At least one field must be provided");
        }


        const updated = await this.prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                ...(dto.projectName ? { projectName: dto.projectName } : {}),
                ...(dto.description ? { description: dto.description } : {}),
            },
            select: {
                id: true,
                projectName: true,
                description: true,
                accessCode: true,
                creationDate: true,
            },
        });

        return {
            message: "Workspace updated successfully",
            workspace: {
                id: updated.id,
                projectName: updated.projectName,
                description: updated.description,
                accessCode: updated.accessCode,
                createdAt: updated.creationDate,
            }
        }
    }

    async joinWorkspace(userId: string, dto: JoinWorkspaceDto) {
        const normalizedCode = dto.accessCode.toUpperCase();

        const workspace = await this.prisma.workspace.findUnique({
            where: { accessCode: normalizedCode },
        });

        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        const alreadyMember = await this.prisma.member.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId: workspace.id,
                },
            },
        });

        if (alreadyMember) {
            throw new ConflictException("User is already in the workspace");
        }

        const membership = await this.prisma.member.create({
            data: {
                userId,
                workspaceId: workspace.id,
                role: WorkspaceRole.MEMBER,
            },
            select: {
                id: true,
                role: true, 
                joinedAt: true,
            },
        });

        return {
            message: "Joined workspace successfully",
            workspace: {
                id: workspace.id,
                projectName: workspace.projectName,
                description: workspace.description,
                accessCode: workspace.accessCode,
            },
            membership,
        };
    }

    async getMyWorkspaces( userId: string) {
        const memberships = await this.prisma.member.findMany({
            where: { userId },
            include: {
                workspace: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        tasks: {
                            select: {
                                id: true,
                                status: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                joinedAt: 'desc',
            },
        });

        return {
            data: memberships.map((membership) => {
                const workspace = membership.workspace;
                const totalTasks = workspace.tasks.length;
                const completedTasks = workspace.tasks.filter(
                    (task) => task.status === "COMPLETED",
                ).length;
                const inProcessTasks = workspace.tasks.filter(
                    (task) => task.status === "IN_PROCESS",
                ).length;

                return {
                    id: workspace.id,
                    project_name: workspace.projectName,
                    description: workspace.description,
                    access_code: workspace.accessCode,
                    role: membership.role,
                    created_at: workspace.creationDate,
                    owner: workspace.owner,
                    stats: {
                        total_tasks: totalTasks,
                        completed_tasks: completedTasks,
                        in_process_tasks: inProcessTasks,
                        progress_percentage:
                            totalTasks === 0
                                ? 0
                                : Math.round((completedTasks / totalTasks) * 100),
                    },
                };
            }),
        };
    }

    async getWorkspaceMembers(workspaceId: string, userId: string) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true },
        });

        if (!workspace) {
        throw new NotFoundException("Workspace not found");
        }

        const requesterMembership = await this.prisma.member.findUnique({
        where: {
            userId_workspaceId: {
            userId,
            workspaceId,
            },
        },
        });

        if (!requesterMembership) {
        throw new ForbiddenException("You are not a member of this workspace");
        }

        const members = await this.prisma.member.findMany({
        where: { workspaceId },
        include: {
            user: {
            select: {
                id: true,
                name: true,
                email: true,
            },
            },
        },
        orderBy: {
            joinedAt: "asc",
        },
        });

        const membersWithStats = await Promise.all(
            members.map(async (member) => {
                const assignedTasks = await this.prisma.task.count({
                where: {
                    workspaceId,
                    assignedToId: member.userId,
                },
                });

                const completedTasks = await this.prisma.task.count({
                    where: {
                        workspaceId,
                        assignedToId: member.userId,
                        status: TaskStatus.COMPLETED,
                    },
                });

                const inProcessTasks = await this.prisma.task.count({
                    where: {
                        workspaceId,
                        assignedToId: member.userId,
                        status: TaskStatus.IN_PROCESS,
                    },
                });

                return {
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email,
                    role: member.role,
                    joined_at: member.joinedAt,
                    task_stats: {
                        assigned_tasks: assignedTasks,
                        completed_tasks: completedTasks,
                        in_process_tasks: inProcessTasks,
                    },
                };
            }),
        );

        return {
        workspace_id: workspaceId,
        members: membersWithStats,
        };
    }

    async deleteWorkspace(workspaceId: string, userId: string) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, ownerId: true },
        });

        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        if (workspace.ownerId !== userId) {
            throw new ForbiddenException("Only the owner can delete this workspace");
        }

        await this.prisma.workspace.delete({
            where: { id: workspaceId },
        });

        return { message: "Workspace deleted successfully" };
    }
}