import { E_INCORRECT_EMAIL_OR_PASSWORD } from './../common/exceptions';
import { UsersService } from './../users/users.service';
import { Injectable, NotAcceptableException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { LoginInputDto } from './dto/inputs/login.input.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { ConnectionResponseDto } from './dto/responses/connection.response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async login(loginDto: LoginInputDto): Promise<ConnectionResponseDto> {
        const user = await this.usersService.findOneForLogin(loginDto.email);
        if (!user) throw new NotAcceptableException(E_INCORRECT_EMAIL_OR_PASSWORD);

        //  Check password
        if (!(await bcrypt.compare(loginDto.password, user.password)))
        throw new NotAcceptableException(E_INCORRECT_EMAIL_OR_PASSWORD);
        
        //  Return the user and the access token
        return {
            accessToken: this.getAccessToken(user),
            user
        };
    }

    getAccessToken (user: User) : string {
        return this.jwtService.sign({ sub: user.id, username: user.email });
    }

    async validateUser(payload: any): Promise<any> {
        return await this.usersService.findOne(payload.id);
    }
}