import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/AuthService";
import { RegisterDto } from "../dto/RegisterDto";
import { LoginDto } from "../dto/LoginDto";
import { JwtAuthGuard } from "../guards/JwtAuthGuard";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto)
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto)
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@Request() req: any) {
        return req.user
    }
}