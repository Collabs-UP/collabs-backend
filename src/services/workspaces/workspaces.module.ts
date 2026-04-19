import { Module } from "@nestjs/common";
import { WorkspacesController } from "./controllers/WorkspacesController";
import { WorkspacesService } from "./services/WorkspacesService";

@Module({
    controllers: [WorkspacesController],
    providers: [WorkspacesService],
    exports: [WorkspacesService],
})
export class WorkspacesModule {}