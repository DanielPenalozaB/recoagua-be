import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { City } from '../cities/entities/city.entity';
import { UserRole } from './enums/user-role.enum';
import { UserResponseDto, UserWithPasswordDto } from './dto/user-response.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserStatus } from './enums/user-status.enum';
import { BulkCreateUserDto } from './dto/bulk-create-user.dto';
import { applySearch, applySort, paginate } from 'src/common/utils/pagination.util';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto, withPassword = false): Promise<UserResponseDto | UserWithPasswordDto> {
    await this.validateEmailUniqueness(createUserDto.email);
    const city = await this.validateCity(createUserDto.cityId);

    const emailConfirmationToken = await this.generateEmailConfirmationToken(createUserDto.email);

    const newUser = this.userRepository.create({
      ...createUserDto,
      city,
      passwordSet: withPassword,
      password: createUserDto.password,
      status: createUserDto.status || UserStatus.PENDING,
      role: createUserDto.role || UserRole.CITIZEN,
      emailConfirmationToken
    });

    const savedUser = await this.userRepository.save(newUser);

    await this.mailService.sendEmailConfirmation(
      newUser.name,
      newUser.email,
      newUser.emailConfirmationToken as string,
    );

    return this.toResponseDto(savedUser, withPassword);
  }

  async bulkCreate(bulkCreateUserDto: BulkCreateUserDto): Promise<UserResponseDto[]> {
    // Validate all emails first
    const emails = bulkCreateUserDto.users.map(user => user.email);
    const existingUsers = await this.userRepository.find({
      where: { email: In(emails) }
    });

    if (existingUsers.length > 0) {
      throw new ConflictException(`Some emails already exist: ${existingUsers.map(u => u.email).join(', ')}`);
    }

    // Validate all cities
    const cityIds = [...new Set(bulkCreateUserDto.users.map(user => user.cityId))];
    const cities = await this.cityRepository.find({
      where: { id: In(cityIds) }
    });

    if (cities.length !== cityIds.length) {
      const missingCityIds = cityIds.filter(id => !cities.some(c => c.id === id));
      throw new BadRequestException(`Invalid city IDs: ${missingCityIds.join(', ')}`);
    }

    const cityMap = new Map(cities.map(city => [city.id, city]));

    // Create users
    const usersToCreate = await Promise.all(bulkCreateUserDto.users.map(async userDto => {
      const emailConfirmationToken = await this.generateEmailConfirmationToken(userDto.email);

      return this.userRepository.create({
        ...userDto,
        city: cityMap.get(userDto.cityId),
        password: userDto.password ? bcrypt.hashSync(userDto.password, 10) : undefined,
        status: userDto.status || UserStatus.PENDING,
        role: userDto.role || UserRole.CITIZEN,
        emailConfirmationToken,
      });
    }));

    try {
      const savedUsers = await this.userRepository.save(usersToCreate);
      return savedUsers.map(user => this.toResponseDto(user));
    } catch {
      throw new InternalServerErrorException('Failed to create users in bulk');
    }
  }

  async findAll(
    filterDto: UserFilterDto,
    request?: Request
  ): Promise<PaginationDto<UserResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'user.updatedAt',
      sortDirection = 'DESC',
      role,
      status,
      cityId,
      language
    } = filterDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.city', 'city');

    // Apply search - now safely passing string (empty string if undefined)
    applySearch(queryBuilder, search, [
      'user.name',
      'user.email'
    ]);

    // Apply filters
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (cityId) {
      queryBuilder.andWhere('city.id = :cityId', { cityId });
    }

    if (language) {
      queryBuilder.andWhere('user.language = :language', { language });
    }

    // Apply sorting - now safely passing strings
    applySort(queryBuilder, sortBy, sortDirection);

    // Execute pagination
    const result = await paginate<User>(queryBuilder, page, limit);

    // Convert to DTO
    const data = result.data.map(user => this.toResponseDto(user));

    return {
      data,
      meta: result.meta
    };
  }

  async findOne(id: number, withPassword = false): Promise<UserResponseDto | UserWithPasswordDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['city'],
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.toResponseDto(user, withPassword);
  }

  async findByEmail(email: string, withPassword = false): Promise<UserResponseDto | UserWithPasswordDto | null> {
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.city', 'city')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL');

    if (withPassword) {
      query.addSelect(['user.password']);
    }

    return await query.getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['city'],
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
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
      where: { id }
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }

  async confirmUserEmail(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      emailConfirmed: true,
      emailConfirmationToken: null,
      status: UserStatus.PENDING
    });
  }

  async setPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
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
      status: UserStatus.ACTIVE
    });
  }

  async findByEmailConfirmationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { emailConfirmationToken: token }
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { passwordResetToken: token }
    });
  }

  async updateEmailConfirmationToken(userId: number, token: string): Promise<void> {
    await this.userRepository.update(userId, {
      emailConfirmationToken: token,
    });
  }

  private async validateEmailUniqueness(email: string, excludeUserId?: number): Promise<void> {
    const where: any = { email };
    if (excludeUserId) {
      where.id = Not(excludeUserId);
    }

    const existingUser = await this.userRepository.findOne({ where });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
  }

  private async validateCity(cityId: number): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { id: cityId }
    });
    if (!city) {
      throw new BadRequestException('Invalid city');
    }
    return city;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private toResponseDto(user: User, withPassword = false): UserResponseDto | UserWithPasswordDto {
    const baseResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      language: user.language,
      role: user.role,
      status: user.status,
      city: user.city ? {
        id: user.city.id,
        name: user.city.name,
        description: user.city.description,
        rainfall: user.city.rainfall,
        language: user.city.language,
        createdAt: user.city.createdAt,
        updatedAt: user.city.updatedAt,
      } : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      emailConfirmed: user.emailConfirmed,
      passwordSet: user.passwordSet,
    };

    if (withPassword) {
      const withPasswordResponse: UserWithPasswordDto = {
        ...baseResponse,
        password: user.password ?? '',
        passwordResetToken: user.passwordResetToken,
        passwordResetExpires: user.passwordResetExpires,
        emailConfirmationToken: user.emailConfirmationToken,
      };
      return withPasswordResponse;
    }

    return baseResponse;
  }

  private async generateEmailConfirmationToken(email: string): Promise<string> {
    const payload = { email, purpose: 'email-confirmation' };
    return this.jwtService.sign(payload, { expiresIn: '24h' });
  }

  private async generatePasswordResetToken(email: string): Promise<string> {
    const payload = { email, purpose: 'password-reset' };
    return this.jwtService.sign(payload, {
      expiresIn: '1h', // Token expires in 1 hour
    });
  }

  async verifyEmailConfirmationToken(token: string): Promise<{ email: string }> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: await bcrypt.hash(refreshToken, 10)
    });
  }

  async getRefreshToken(userId: number): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['refreshToken']
    });
    return user?.refreshToken || null;
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: null
    });
  }

  async findByPasswordSetupToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
      relations: ['city'],
    });
  }

  async validatePasswordSetupToken(token: string): Promise<{ isValid: boolean; user?: User }> {
    const user = await this.findByPasswordSetupToken(token);

    if (!user) {
      return { isValid: false };
    }

    return { isValid: true, user };
  }
}