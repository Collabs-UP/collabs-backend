import { IsString, MinLength } from "class-validator";

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  projectName!: string;

  @IsString()
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  description!: string;
}