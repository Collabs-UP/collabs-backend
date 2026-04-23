import { IsDateString, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(5)
  description!: string;

  @IsString()
  assignedToId!: string;

  @IsDateString()
  dueDate!: string;
}
