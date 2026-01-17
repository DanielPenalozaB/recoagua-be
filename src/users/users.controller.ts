import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BulkCreateUserDto } from "./dto/bulk-create-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserFilterDto } from "./dto/user-filter.dto";
import { UserProfileDto } from "./dto/user-profile.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserRole } from "./enums/user-role.enum";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new user" })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Email already in use" })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto, false);
  }

  @Post("bulk")
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create multiple users at once" })
  @ApiCreatedResponse({ type: [UserResponseDto] })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 409,
    description: "One or more emails already in use",
  })
  async bulkCreate(
    @Body() bulkCreateUserDto: BulkCreateUserDto,
  ): Promise<UserResponseDto[]> {
    return this.usersService.bulkCreate(bulkCreateUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List and filter users with pagination" })
  @ApiResponse({
    status: 200,
    description: "Paginated list of users",
    type: PaginationDto<UserResponseDto>,
  })
  findAll(
    @Query() filterDto: UserFilterDto,
    @Req() request: Request,
  ): Promise<PaginationDto<UserResponseDto>> {
    return this.usersService.findAll(filterDto, request);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiOkResponse({ type: UserProfileDto })
  async getProfile(@Req() req): Promise<UserProfileDto> {
    const userId = req.user.sub || req.user.id;
    return this.usersService.getProfile(userId);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a user by ID" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a user" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 409, description: "Email already in use" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a user (soft delete)" })
  @ApiResponse({ status: 204, description: "User deleted" })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.usersService.remove(id);
  }
}
