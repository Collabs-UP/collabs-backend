import { TaskStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
