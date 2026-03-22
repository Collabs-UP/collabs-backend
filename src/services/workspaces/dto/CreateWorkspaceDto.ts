import { IsString, MinLength } from "class-validator";

export class CreateWorkspaceDto {
    @IsString()
    @MinLength(3)
    projectName!: string

    @IsString()
    @MinLength(5)
    description!: string
}