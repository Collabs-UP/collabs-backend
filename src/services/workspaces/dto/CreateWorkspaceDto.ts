import { IsString, MinLength } from "class-validator";

export class CreateWokspaceDto {
    @IsString()
    @MinLength(3)
    projectName!: string

    @IsString()
    @MinLength(5)
    description!: string
}