import { Module } from "@nestjs/common";
import { TaskController } from "./controllers/TaskController";
import { TaskService } from "./services/TaskService";

@Module({
    controllers: [TaskController],
    providers: [TaskService],
    exports: [TaskService],
})
export class TaskModule {}