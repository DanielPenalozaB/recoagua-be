import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBlockResponse } from './entities/user-block-response.entity';
import { User } from '../users/entities/user.entity';
import { Block } from '../blocks/entities/block.entity';
import { CreateUserBlockResponseDto } from './dto/create-user-block-response.dto';

@Injectable()
export class UserBlockResponseService {
  constructor(
    @InjectRepository(UserBlockResponse)
    private readonly userBlockResponseRepository: Repository<UserBlockResponse>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
  ) {}

  async create(createDto: CreateUserBlockResponseDto): Promise<UserBlockResponse> {
    const user = await this.userRepository.findOne({
      where: { id: createDto.userId }
    });
    const block = await this.blockRepository.findOne({
      where: { id: createDto.blockId }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createDto.userId} not found`);
    }
    if (!block) {
      throw new NotFoundException(`Block with ID ${createDto.blockId} not found`);
    }

    const response = this.userBlockResponseRepository.create({
      ...createDto,
      user,
      block,
    });

    return await this.userBlockResponseRepository.save(response);
  }

  async findAll(userId?: number, blockId?: number): Promise<UserBlockResponse[]> {
    const queryBuilder = this.userBlockResponseRepository
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.user', 'user')
      .leftJoinAndSelect('response.block', 'block')
      .leftJoinAndSelect('response.answerDetails', 'details')
      .orderBy('response.submittedAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('user.id = :userId', { userId });
    }

    if (blockId) {
      queryBuilder.andWhere('block.id = :blockId', { blockId });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<UserBlockResponse> {
    const response = await this.userBlockResponseRepository
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.user', 'user')
      .leftJoinAndSelect('response.block', 'block')
      .leftJoinAndSelect('response.answerDetails', 'details')
      .where('response.id = :id', { id })
      .getOne();

    if (!response) {
      throw new NotFoundException(`User block response with ID ${id} not found`);
    }

    return response;
  }

  async findByUserAndBlock(userId: number, blockId: number): Promise<UserBlockResponse | null> {
    return await this.userBlockResponseRepository
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.user', 'user')
      .leftJoinAndSelect('response.block', 'block')
      .leftJoinAndSelect('response.answerDetails', 'details')
      .where('user.id = :userId', { userId })
      .andWhere('block.id = :blockId', { blockId })
      .getOne();
  }

  async getUserBlockStats(userId: number) {
    const totalResponses = await this.userBlockResponseRepository.count({
      where: { user: { id: userId } }
    });

    const correctResponses = await this.userBlockResponseRepository.count({
      where: { 
        user: { id: userId },
        isCorrect: true
      }
    });

    return {
      totalResponses,
      correctResponses,
      incorrectResponses: totalResponses - correctResponses,
      accuracyRate: totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0,
    };
  }

  async getBlockStats(blockId: number) {
    const totalResponses = await this.userBlockResponseRepository.count({
      where: { block: { id: blockId } }
    });

    const correctResponses = await this.userBlockResponseRepository.count({
      where: { 
        block: { id: blockId },
        isCorrect: true
      }
    });

    const uniqueUsers = await this.userBlockResponseRepository
      .createQueryBuilder('response')
      .select('COUNT(DISTINCT response.user.id)', 'count')
      .where('response.block.id = :blockId', { blockId })
      .getRawOne();

    return {
      totalResponses,
      correctResponses,
      incorrectResponses: totalResponses - correctResponses,
      accuracyRate: totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0,
      uniqueUsers: parseInt(uniqueUsers?.count || '0'),
    };
  }
}