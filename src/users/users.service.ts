import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { PaginationDto } from "src/common/dto/pagination.dto";
import {
  applySearch,
  applySort,
  paginate,
} from "src/common/utils/pagination.util";
import { MailService } from "src/mail/mail.service";
import { In, MoreThan, Not, Repository } from "typeorm";
import { City } from "../cities/entities/city.entity";
import { BulkCreateUserDto } from "./dto/bulk-create-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserFilterDto } from "./dto/user-filter.dto";
import { UserResponseDto, UserWithPasswordDto } from "./dto/user-response.dto";
import { User } from "./entities/user.entity";
import { UserRole } from "./enums/user-role.enum";
import { UserStatus } from "./enums/user-status.enum";

import { LevelResponseDto } from "src/levels/dto/level-response.dto";
import { LevelsService } from "src/levels/levels.service";
import { CompletionStatus } from "src/user-progress/enums/completion-status.enum";
import { UserProfileDto } from "./dto/user-profile.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly levelsService: LevelsService,
  ) {}

  async addExperience(
    userId: number,
    points: number,
  ): Promise<{ user: UserResponseDto; leveledUp: boolean; newLevel: any }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["level", "city"],
    });
    if (!user) throw new NotFoundException("User not found");

    user.experience = (user.experience || 0) + points;

    // Check for level up
    const potentialLevel = await this.levelsService.findLevelByPoints(
      user.experience,
    );
    let leveledUp = false;
    let newLevel: LevelResponseDto | null = null;

    if (
      potentialLevel &&
      (!user.level || potentialLevel.id !== user.level.id)
    ) {
      if (!user.level || potentialLevel.id !== user.level.id) {
        leveledUp = true;
        newLevel = potentialLevel;
        user.level = { id: potentialLevel.id } as any;
      }
    }

    const savedUser = await this.userRepository.save(user);

    return {
      user: this.toResponseDto(savedUser),
      leveledUp,
      newLevel,
    };
  }

  async create(
    createUserDto: CreateUserDto,
    withPassword = false,
  ): Promise<UserResponseDto | UserWithPasswordDto> {
    await this.validateEmailUniqueness(createUserDto.email);
    const city = await this.validateCity(createUserDto.cityId);

    const emailConfirmationToken = await this.generateEmailConfirmationToken(
      createUserDto.email,
    );

    const newUser = this.userRepository.create({
      ...createUserDto,
      city,
      passwordSet: withPassword,
      password: createUserDto.password,
      status: createUserDto.status || UserStatus.PENDING,
      role: createUserDto.role || UserRole.CITIZEN,
      emailConfirmationToken,
    });

    const savedUser = await this.userRepository.save(newUser);

    await this.mailService.sendEmailConfirmation(
      newUser.name,
      newUser.email,
      newUser.emailConfirmationToken as string,
    );

    return this.toResponseDto(savedUser, withPassword);
  }

  async bulkCreate(
    bulkCreateUserDto: BulkCreateUserDto,
  ): Promise<UserResponseDto[]> {
    // Validate all emails first
    const emails = bulkCreateUserDto.users.map((user) => user.email);
    const existingUsers = await this.userRepository.find({
      where: { email: In(emails) },
    });

    if (existingUsers.length > 0) {
      throw new ConflictException(
        `Some emails already exist: ${existingUsers.map((u) => u.email).join(", ")}`,
      );
    }

    // Validate all cities
    const cityIds = [
      ...new Set(bulkCreateUserDto.users.map((user) => user.cityId)),
    ];
    const cities = await this.cityRepository.find({
      where: { id: In(cityIds) },
    });

    if (cities.length !== cityIds.length) {
      const missingCityIds = cityIds.filter(
        (id) => !cities.some((c) => c.id === id),
      );
      throw new BadRequestException(
        `Invalid city IDs: ${missingCityIds.join(", ")}`,
      );
    }

    const cityMap = new Map(cities.map((city) => [city.id, city]));

    // Create users
    const usersToCreate = await Promise.all(
      bulkCreateUserDto.users.map(async (userDto) => {
        const emailConfirmationToken =
          await this.generateEmailConfirmationToken(userDto.email);

        return this.userRepository.create({
          ...userDto,
          city: cityMap.get(userDto.cityId),
          password: userDto.password
            ? bcrypt.hashSync(userDto.password, 10)
            : undefined,
          status: userDto.status || UserStatus.PENDING,
          role: userDto.role || UserRole.CITIZEN,
          emailConfirmationToken,
        });
      }),
    );

    try {
      const savedUsers = await this.userRepository.save(usersToCreate);
      return savedUsers.map((user) => this.toResponseDto(user));
    } catch {
      throw new InternalServerErrorException("Failed to create users in bulk");
    }
  }

  async findAll(
    filterDto: UserFilterDto,
    request?: Request,
  ): Promise<PaginationDto<UserResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "user.updatedAt",
      sortDirection = "DESC",
      role,
      status,
      cityId,
      language,
    } = filterDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.city", "city");

    // Apply search - now safely passing string (empty string if undefined)
    applySearch(queryBuilder, search, ["user.name", "user.email"]);

    // Apply filters
    if (role) {
      queryBuilder.andWhere("user.role = :role", { role });
    }

    if (status) {
      queryBuilder.andWhere("user.status = :status", { status });
    }

    if (cityId) {
      queryBuilder.andWhere("city.id = :cityId", { cityId });
    }

    if (language) {
      queryBuilder.andWhere("user.language = :language", { language });
    }

    // Apply sorting - now safely passing strings
    applySort(queryBuilder, sortBy, sortDirection);

    // Execute pagination
    const result = await paginate<User>(queryBuilder, page, limit);

    // Convert to DTO
    const data = result.data.map((user) => this.toResponseDto(user));

    return {
      data,
      meta: result.meta,
    };
  }

  async findOne(
    id: number,
    withPassword = false,
  ): Promise<UserResponseDto | UserWithPasswordDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["city", "level"],
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException("User not found");
    }

    return this.toResponseDto(user, withPassword);
  }

  async findByEmail(
    email: string,
    withPassword = false,
  ): Promise<UserResponseDto | UserWithPasswordDto | null> {
    const query = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.city", "city")
      .leftJoinAndSelect("user.level", "level")
      .where("user.email = :email", { email })
      .andWhere("user.deletedAt IS NULL");

    if (withPassword) {
      query.addSelect(["user.password"]);
    }

    return await query.getOne();
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["city"],
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException("User not found");
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.validateEmailUniqueness(updateUserDto.email, id);
    }

    if (updateUserDto.cityId) {
      user.city = await this.validateCity(updateUserDto.cityId);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    return this.toResponseDto(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException("User not found");
    }

    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }

  async confirmUserEmail(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      emailConfirmed: true,
      status: UserStatus.PENDING,
    });
  }

  async setPasswordResetToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      passwordSet: false,
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
    });
  }

  async clearPasswordResetToken(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      passwordSet: false,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    await this.userRepository.update(userId, {
      password: hashedPassword,
      passwordSet: true,
      passwordResetToken: null,
      passwordResetExpires: null,
      status: UserStatus.ACTIVE,
    });
  }

  async findByEmailConfirmationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { emailConfirmationToken: token },
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { passwordResetToken: token },
    });
  }

  async updateEmailConfirmationToken(
    userId: number,
    token: string,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      emailConfirmationToken: token,
    });
  }

  private async validateEmailUniqueness(
    email: string,
    excludeUserId?: number,
  ): Promise<void> {
    const where: any = { email };
    if (excludeUserId) {
      where.id = Not(excludeUserId);
    }

    const existingUser = await this.userRepository.findOne({ where });

    if (existingUser) {
      throw new ConflictException("Email already in use");
    }
  }

  private async validateCity(cityId: number): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { id: cityId },
    });
    if (!city) {
      throw new BadRequestException("Invalid city");
    }
    return city;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private toResponseDto(
    user: User,
    withPassword = false,
  ): UserResponseDto | UserWithPasswordDto {
    const baseResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      language: user.language,
      role: user.role,
      status: user.status,
      experience: user.experience || 0,
      level: user.level
        ? {
            id: user.level.id,
            name: user.level.name,
            description: user.level.description,
            requiredPoints: user.level.requiredPoints,
            rewards: user.level.rewards,
            createdAt: user.level.createdAt,
            updatedAt: user.level.updatedAt,
            deletedAt: user.level.deletedAt,
          }
        : null,
      city: user.city
        ? {
            id: user.city.id,
            name: user.city.name,
            description: user.city.description,
            rainfall: user.city.rainfall,
            language: user.city.language,
            createdAt: user.city.createdAt,
            updatedAt: user.city.updatedAt,
          }
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      emailConfirmed: user.emailConfirmed,
      passwordSet: user.passwordSet,
    };

    if (withPassword) {
      const withPasswordResponse: UserWithPasswordDto = {
        ...baseResponse,
        password: user.password ?? "",
        passwordResetToken: user.passwordResetToken,
        passwordResetExpires: user.passwordResetExpires,
        emailConfirmationToken: user.emailConfirmationToken,
      };
      return withPasswordResponse;
    }

    return baseResponse;
  }

  private async generateEmailConfirmationToken(email: string): Promise<string> {
    const payload = { email, purpose: "email-confirmation" };
    return this.jwtService.sign(payload, { expiresIn: "24h" });
  }

  private async generatePasswordResetToken(email: string): Promise<string> {
    const payload = { email, purpose: "password-reset" };
    return this.jwtService.sign(payload, {
      expiresIn: "1h", // Token expires in 1 hour
    });
  }

  async verifyEmailConfirmationToken(
    token: string,
  ): Promise<{ email: string }> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new BadRequestException("Invalid or expired token");
    }
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async getRefreshToken(userId: number): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ["id", "refreshToken"],
    });
    return user?.refreshToken || null;
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: null,
    });
  }

  async findByPasswordSetupToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
      relations: ["city"],
    });
  }

  async validatePasswordSetupToken(
    token: string,
  ): Promise<{ isValid: boolean; user?: User }> {
    const user = await this.findByPasswordSetupToken(token);

    if (!user) {
      return { isValid: false };
    }

    return { isValid: true, user };
  }

  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        "level",
        "city",
        "progress",
        "progress.guide",
        "progress.guide.modules",
        "badges",
        "badges.badge",
        "challenges",
        "challenges.challenge",
      ],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Get all levels to determine obtained levels
    // Assuming a reasonable number of levels, fetching all is fine.
    const allLevelsResult = await this.levelsService.findAll({ limit: 1000 });
    const levelsObtained = allLevelsResult.data
      .filter((l) => (user.experience || 0) >= l.requiredPoints)
      // Sort by required points ascending
      .sort((a, b) => a.requiredPoints - b.requiredPoints);

    // Group progress by guide to determine overall status
    const guideProgressMap = new Map<
      number,
      {
        guide: any;
        completedModules: number;
        totalModules: number;
        startedAt: Date;
        lastActivityAt: Date; // using completedAt or createdAt
        totalPointsEarned: number;
      }
    >();

    for (const p of user.progress) {
      if (!p.guide) continue;
      const gId = p.guide.id;

      if (!guideProgressMap.has(gId)) {
        // totalModules for this guide
        const modules = p.guide.modules || [];
        guideProgressMap.set(gId, {
          guide: p.guide,
          completedModules: 0,
          totalModules: modules.length,
          startedAt: p.createdAt,
          lastActivityAt: p.createdAt,
          totalPointsEarned: 0,
        });
      }

      const entry = guideProgressMap.get(gId)!;
      if (p.completionStatus === CompletionStatus.COMPLETED) {
        entry.completedModules++;
        entry.totalPointsEarned += Number(p.earnedPoints) || 0;
      }

      // Keep earliest start date
      if (p.createdAt < entry.startedAt) {
        entry.startedAt = p.createdAt;
      }

      // Keep latest activity (completedAt or createdAt)
      const effectiveDate = p.completedAt || p.createdAt;
      if (effectiveDate > entry.lastActivityAt) {
        entry.lastActivityAt = effectiveDate;
      }
    }

    const completedGuides: any[] = [];
    const inProgressGuides: any[] = [];

    for (const entry of guideProgressMap.values()) {
      const {
        guide,
        completedModules,
        totalModules,
        startedAt,
        lastActivityAt,
        totalPointsEarned,
      } = entry;

      // A guide is completed if all its modules are completed
      // (Assuming a guide has at least 1 module, otherwise it's trivial)
      if (totalModules > 0 && completedModules >= totalModules) {
        completedGuides.push({
          ...guide,
          completedAt: lastActivityAt, // Approximate completion time as the last module update
          earnedPoints: totalPointsEarned, // Sum of module points
        });
      } else {
        // If started but not fully completed
        inProgressGuides.push({
          ...guide,
          startedAt: startedAt,
        });
      }
    }

    const badges = user.badges.map((ub) => ({
      ...ub.badge,
      earnedAt: ub.earnedAt,
    }));

    const challenges = user.challenges.map((uc) => ({
      ...uc.challenge,
      completionStatus: uc.completionStatus,
      completedAt: uc.completedAt,
      earnedPoints: uc.earnedPoints,
    }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      experience: user.experience || 0,
      level: user.level,
      city: user.city,
      role: user.role,
      status: user.status,
      completedGuides,
      inProgressGuides,
      levelsObtained: levelsObtained as any[],
      badges,
      challenges,
      completedGuidesCount: completedGuides.length,
      badgesCount: badges.length,
    };
  }
}
