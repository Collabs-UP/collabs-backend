import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from '../dto/CreateTaskDto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(spaceId: string, userId: string, dto: CreateTaskDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: spaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
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
      throw new BadRequestException(
        'Assignee must be a member of the workspace',
      );
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
      throw new ForbiddenException(
        'Only the assignee can update the task status',
      );
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
      message: 'Task status updated successfully',
      task: updatedTask,
    };
  }

  async listTasks(workspaceId: string, userId: string, status?: TaskStatus) {
    const membership = await this.prisma.member.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    const tasks = await this.prisma.task.findMany({
      where: {
        workspaceId,
        ...(status ? { status } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        creationDate: true,
        dueDate: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        creationDate: 'desc',
      },
    });

    const totalTasks = await this.prisma.task.count({ where: { workspaceId } });

    const completedTasks = await this.prisma.task.count({
      where: { workspaceId, status: TaskStatus.COMPLETED },
    });

    const inProcessTasks = await this.prisma.task.count({
      where: { workspaceId, status: TaskStatus.IN_PROCESS },
    });

    return {
      workspaceId: workspaceId,
      tasks,
      summary: {
        totalTasks: totalTasks,
        completedTasks: completedTasks,
        inProcessTasks: inProcessTasks,
        progressPercentage:
          totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100),
      },
    };
  }

  async removeTask(workspaceId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId: workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada en este proyecto');
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Tarea eliminada exitosamente' };
  }
}
