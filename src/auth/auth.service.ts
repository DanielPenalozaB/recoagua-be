import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenPayload } from './interfaces/token-payload.interface';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from '../users/enums/user-role.enum';
import { MailService } from '../mail/mail.service';
import { UserStatus } from 'src/users/enums/user-status.enum';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserResponseDto, UserWithPasswordDto } from 'src/users/dto/user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour
  private readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
  private readonly ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 60; // 1 hour

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserResponseDto> {
    const user = await this.usersService.findByEmail(email, true);

    if (!user || !('password' in user)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailConfirmed) {
      throw new UnauthorizedException('Please confirm your email first');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cityId: user.city?.id,
    };

    // Generate both access and refresh tokens
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = this.generateRefreshToken(user.id);

    // Store refresh token in database (you'll need to add this to your user model)
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<LoginResponseDto> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);

      // Find user and verify refresh token is still valid
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token matches the one stored in database
      const storedRefreshToken = await this.usersService.getRefreshToken(user.id);
      if (storedRefreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newPayload: TokenPayload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        cityId: user.city?.id,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      });

      const newRefreshToken = this.generateRefreshToken(user.id);

      // Update refresh token in database
      await this.usersService.updateRefreshToken(user.id, newRefreshToken);

      return {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateRefreshToken(userId: number): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );
  }

  async logout(userId: number): Promise<{ message: string }> {
    // Clear refresh token from database
    await this.usersService.clearRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);
    const emailConfirmationToken = crypto.randomBytes(32).toString('hex');

    // Create a new user with all required fields
    const userData = {
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      cityId: registerDto.cityId,
      language: registerDto.language,
      role: UserRole.CITIZEN,
      status: UserStatus.PENDING,
      emailConfirmationToken,
      emailConfirmed: false,
    };

    const { password, passwordResetExpires, passwordResetToken, passwordSet, emailConfirmed, status, ...newUser } = await this.usersService.create(userData, true) as UserWithPasswordDto;

    await this.mailService.sendEmailConfirmation(
      newUser.name,
      newUser.email,
      newUser.emailConfirmationToken as string,
    );

    return newUser;
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDto) {
    const user = await this.usersService.findByEmailConfirmationToken(
      confirmEmailDto.token,
    );

    if (!user) {
      throw new BadRequestException('Invalid confirmation token');
    }

    if (user.emailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    return this.usersService.confirmUserEmail(user.id);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId, true);

    if (!user || !('password' in user)) {
      throw new NotFoundException('User not found');
    }

    if (user.password && !(await this.comparePasswords(changePasswordDto.currentPassword, user.password))) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (changePasswordDto.newPassword === changePasswordDto.currentPassword) {
      throw new BadRequestException('New password must be different');
    }

    const hashedPassword = await this.hashPassword(changePasswordDto.newPassword);
    await this.usersService.updatePassword(user.id, hashedPassword);

    // Clear all refresh tokens when password changes for security
    await this.usersService.clearRefreshToken(user.id);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      // Don't reveal if user doesn't exist for security
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await this.usersService.setPasswordResetToken(user.id, resetToken, expiresAt);

    await this.mailService.sendPasswordResetEmail(
      user.name,
      user.email,
      resetToken,
    );

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByPasswordResetToken(resetPasswordDto.token);

    if (!user?.passwordResetToken || new Date(user.passwordResetExpires || new Date()) < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await this.hashPassword(resetPasswordDto.newPassword);
    await this.usersService.updatePassword(user.id, hashedPassword);
    await this.usersService.clearPasswordResetToken(user.id);

    // Clear all refresh tokens when password is reset for security
    await this.usersService.clearRefreshToken(user.id);

    return { message: 'Password reset successfully' };
  }

  async resendConfirmationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    await this.usersService.updateEmailConfirmationToken(user.id, newToken);

    await this.mailService.sendEmailConfirmation(
      user.name,
      user.email,
      newToken,
    );

    return { message: 'Confirmation email resent' };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    return this.usersService.findOne(userId);
  }

  async generateEmailConfirmationToken(email: string): Promise<string> {
    return this.jwtService.sign(
      { email },
      { expiresIn: '24h' }
    );
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    return this.jwtService.sign(
      { email },
      { expiresIn: '1h' }
    );
  }

  async verifyToken<T extends object>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token);
  }

  private async verifyRefreshToken(userId: number, providedToken: string): Promise<boolean> {
    const storedHashedToken = await this.usersService.getRefreshToken(userId);
    if (!storedHashedToken) return false;

    return await bcrypt.compare(providedToken, storedHashedToken);
  }
}