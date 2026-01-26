import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Patch,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ConfirmEmailDto } from "./dto/confirm-email.dto";
import { ResendConfirmationDto } from "./dto/resend-confirmation.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserResponseDto } from "../users/dto/user-response.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { Throttle } from "@nestjs/throttler";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Only 5 login attempts per minute
  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("register")
  @ApiOperation({ summary: "Register new user" })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 400, description: "Email already in use" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("confirm-email")
  @ApiOperation({ summary: "Confirm email address" })
  @ApiResponse({ status: 200, description: "Email confirmed successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid token or email already confirmed",
  })
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return this.authService.confirmEmail(confirmEmailDto);
  }

  @Post("request-reactivation")
  @ApiOperation({ summary: "Request manual reactivation for expired token" })
  @ApiResponse({ status: 200, description: "Request logged successfully" })
  async requestReactivation(@Body() body: { token: string }) {
    return this.authService.requestReactivation(body.token);
  }

  @Post("resend-confirmation")
  @ApiOperation({ summary: "Resend email confirmation" })
  @ApiResponse({ status: 200, description: "Confirmation email resent" })
  @ApiResponse({ status: 400, description: "Email already confirmed" })
  @ApiResponse({ status: 404, description: "User not found" })
  async resendConfirmation(
    @Body() resendConfirmationDto: ResendConfirmationDto,
  ) {
    return this.authService.resendConfirmationEmail(
      resendConfirmationDto.email,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch("change-password")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change password" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({
    status: 400,
    description: "Current password incorrect or new password invalid",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({
    status: 200,
    description: "If the email exists, a reset link has been sent",
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password with token" })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired reset token" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user info" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getCurrentUser(@Req() req) {
    return this.authService.getCurrentUser(req.user.id);
  }

  @Post("refresh-token")
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    return this.authService.logout(req.user.sub);
  }

  @Post("validate-password-token")
  async validatePasswordToken(@Body() body: { token: string }) {
    return this.authService.validatePasswordToken(body.token);
  }

  @Post("setup-password")
  async setupPassword(
    @Body() setPasswordDto: { token: string; newPassword: string },
  ) {
    return this.authService.setupPassword(setPasswordDto);
  }
}
