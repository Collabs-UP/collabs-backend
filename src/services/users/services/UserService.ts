import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from 'src/services/users/dto/UpdateUserDto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateMe(userId: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      user: updated,
    };
  }

  async deleteMe(userId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const ownedWorkspaces = await this.prisma.workspace.count({
      where: { ownerId: userId },
    });

    if (ownedWorkspaces > 0) {
      throw new ConflictException(
        'Transfer or delete your owned workspaces before deleting your user',
      );
    }

    const assignedTasks = await this.prisma.task.count({
      where: { assignedToId: userId },
    });

    if (assignedTasks > 0) {
      throw new ConflictException(
        'Reassign your tasks before deleting your user',
      );
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'User deleted successfully',
    };
  }
}
