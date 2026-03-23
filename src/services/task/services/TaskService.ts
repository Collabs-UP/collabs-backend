import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTaskDto } from "../dto/CreateTaskDto";
import { TaskStatus } from "@prisma/client";

@Injectable()
export class TaskService {
    constructor (private readonly prisma: PrismaService) {}

    async createTask(spaceId: string, userId: string, dto: CreateTaskDto) {
        const workspace = await this.prisma.workspace.findUnique({
            where: {id: spaceId},
        });

        if(!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        if(workspace.ownerId !== userId) {
            throw new ForbiddenException('Only workspace owner can create tasks');
        }

        const assigneeMembership = await this.prisma.member.findUnique({
            where: {
                userId_workspaceId: {
                    userId: dto.assignedToId,
                    workspaceId: spaceId,
                },
            },
        });

        if (!assigneeMembership) {
            throw new BadRequestException('Assignee must be a member of the workspace');
        }

        const task = await this.prisma.task.create({
            data: {
                workspaceId: spaceId,
                assignedToId: dto.assignedToId,
                title: dto.title,
                description: dto.description,
                dueDate: new Date(dto.dueDate),
                status: TaskStatus.IN_PROCESS,
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                dueDate: true,
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return {
            message: 'Task created successfully',
            task,
        };
    }

    async updateTaskStatus(taskId: string, userId: string, status: TaskStatus) {

        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: {
                id: true,
                assignedToId: true,
                status: true,
            },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.assignedToId !== userId) {
            throw new ForbiddenException('Only the assignee can update the task status');
        }

        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data: { status },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                dueDate: true,
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return {
            message: "Task status updated successfully",
            task: updatedTask,
        }
    }
}