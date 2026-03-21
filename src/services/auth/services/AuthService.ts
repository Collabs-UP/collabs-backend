import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterDto } from "../dto/RegisterDto";
import * as bcrypt from 'bcrypt';
import { LoginDto } from "../dto/LoginDto";

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() }
        });

        if (existing) {
            throw new ConflictException("Email already in use");
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email.toLowerCase(),
                password: passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return {
            message: "User registered successfully",
            user,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if(!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isValidPassword = await bcrypt.compare(dto.password, user.password);

        if (!isValidPassword) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const token = this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
            name: user.name,
        });

        return {
            access_token: token,
            token_type: 'Bearer',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }
}