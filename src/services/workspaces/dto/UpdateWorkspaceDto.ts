import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  projectName?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  description?: string;
}
