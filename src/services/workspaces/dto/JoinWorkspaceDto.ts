import { IsString, Length } from "class-validator";

export class JoinWorkspaceDto {
    @IsString()
    @Length(6, 6)
    accessCode!: string;
}