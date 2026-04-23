import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  // El parámetro ahora es conceptualmente el userId
  async removeMember(workspaceId: string, userId: string) {
    // 1. Buscamos la relación exacta combinando el espacio y el usuario
    const membership = await this.prisma.member.findFirst({
      where: {
        workspaceId: workspaceId,
        userId: userId,
      },
    });

    // Si no lo encuentra, lanza el 404 que estabas viendo
    if (!membership) {
      throw new NotFoundException('Miembro no encontrado en este proyecto');
    }

    // 2. Buscamos el workspace para saber quién es el dueño (Admin)
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    // 3. Reasignamos todas las tareas de este usuario al dueño
    if (workspace) {
      await this.prisma.task.updateMany({
        where: {
          workspaceId: workspaceId,
          assignedToId: userId,
        },
        data: {
          assignedToId: workspace.ownerId,
        },
      });
    }

    // 4. Ahora sí, le quitamos el acceso al proyecto
    await this.prisma.member.delete({
      where: { id: membership.id },
    });

    return {
      message: 'Miembro eliminado y tareas reasignadas al administrador',
    };
  }
}
