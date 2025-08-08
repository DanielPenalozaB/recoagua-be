import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import { BlockAnswer } from './entities/block-answer.entity';
import { RelationalPair } from './entities/relational-pair.entity';
import { Module } from '../modules/entities/module.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { CreateBlockAnswerDto } from './dto/create-block-answer.dto';
import { CreateRelationalPairDto } from './dto/create-relational-pair.dto';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @InjectRepository(BlockAnswer)
    private readonly blockAnswerRepository: Repository<BlockAnswer>,
    @InjectRepository(RelationalPair)
    private readonly relationalPairRepository: Repository<RelationalPair>,
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
  ) {}

  async create(createBlockDto: CreateBlockDto): Promise<Block> {
    const module = await this.moduleRepository.findOne({
      where: { id: createBlockDto.moduleId }
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${createBlockDto.moduleId} not found`);
    }

    // Check for duplicate order within the same module
    const existingBlock = await this.blockRepository.findOne({
      where: {
        module: { id: createBlockDto.moduleId },
        order: createBlockDto.order
      }
    });

    if (existingBlock) {
      throw new BadRequestException(`Block with order ${createBlockDto.order} already exists in this module`);
    }

    const block = this.blockRepository.create({
      ...createBlockDto,
      module,
    });

    return await this.blockRepository.save(block);
  }

  async findAll(moduleId?: number): Promise<Block[]> {
    const queryBuilder = this.blockRepository
      .createQueryBuilder('block')
      .leftJoinAndSelect('block.module', 'module')
      .leftJoinAndSelect('block.answers', 'answers')
      .leftJoinAndSelect('block.relationalPairs', 'pairs')
      .orderBy('block.order', 'ASC')
      .addOrderBy('answers.order', 'ASC');

    if (moduleId) {
      queryBuilder.where('module.id = :moduleId', { moduleId });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Block> {
    const block = await this.blockRepository
      .createQueryBuilder('block')
      .leftJoinAndSelect('block.module', 'module')
      .leftJoinAndSelect('block.answers', 'answers')
      .leftJoinAndSelect('block.relationalPairs', 'pairs')
      .where('block.id = :id', { id })
      .orderBy('answers.order', 'ASC')
      .getOne();

    if (!block) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }

    return block;
  }

  async update(id: number, updateBlockDto: UpdateBlockDto): Promise<Block> {
    const block = await this.findOne(id);

    // Check for duplicate order if order is being updated
    if (updateBlockDto.order && updateBlockDto.order !== block.order) {
      const existingBlock = await this.blockRepository.findOne({
        where: {
          module: { id: block.module.id },
          order: updateBlockDto.order,
        }
      });

      if (existingBlock && existingBlock.id !== id) {
        throw new BadRequestException(`Block with order ${updateBlockDto.order} already exists in this module`);
      }
    }

    Object.assign(block, updateBlockDto);
    return await this.blockRepository.save(block);
  }

  async remove(id: number): Promise<void> {
    const block = await this.findOne(id);
    await this.blockRepository.softDelete(id);
  }

  // Block Answer operations
  async createAnswer(createAnswerDto: CreateBlockAnswerDto): Promise<BlockAnswer> {
    const block = await this.blockRepository.findOne({
      where: { id: createAnswerDto.blockId }
    });

    if (!block) {
      throw new NotFoundException(`Block with ID ${createAnswerDto.blockId} not found`);
    }

    const answer = this.blockAnswerRepository.create({
      ...createAnswerDto,
      block,
    });

    return await this.blockAnswerRepository.save(answer);
  }

  async updateAnswer(id: number, updateData: Partial<CreateBlockAnswerDto>): Promise<BlockAnswer> {
    const answer = await this.blockAnswerRepository.findOne({ where: { id } });
    
    if (!answer) {
      throw new NotFoundException(`Block answer with ID ${id} not found`);
    }

    Object.assign(answer, updateData);
    return await this.blockAnswerRepository.save(answer);
  }

  async removeAnswer(id: number): Promise<void> {
    const answer = await this.blockAnswerRepository.findOne({ where: { id } });
    
    if (!answer) {
      throw new NotFoundException(`Block answer with ID ${id} not found`);
    }

    await this.blockAnswerRepository.remove(answer);
  }

  // Relational Pair operations
  async createRelationalPair(createPairDto: CreateRelationalPairDto): Promise<RelationalPair> {
    const block = await this.blockRepository.findOne({
      where: { id: createPairDto.blockId }
    });

    if (!block) {
      throw new NotFoundException(`Block with ID ${createPairDto.blockId} not found`);
    }

    const pair = this.relationalPairRepository.create({
      ...createPairDto,
      block,
    });

    return await this.relationalPairRepository.save(pair);
  }

  async updateRelationalPair(id: number, updateData: Partial<CreateRelationalPairDto>): Promise<RelationalPair> {
    const pair = await this.relationalPairRepository.findOne({ where: { id } });
    
    if (!pair) {
      throw new NotFoundException(`Relational pair with ID ${id} not found`);
    }

    Object.assign(pair, updateData);
    return await this.relationalPairRepository.save(pair);
  }

  async removeRelationalPair(id: number): Promise<void> {
    const pair = await this.relationalPairRepository.findOne({ where: { id } });
    
    if (!pair) {
      throw new NotFoundException(`Relational pair with ID ${id} not found`);
    }

    await this.relationalPairRepository.remove(pair);
  }

  async reorderBlocks(moduleId: number, blockOrders: { id: number; order: number }[]): Promise<Block[]> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
      relations: ['blocks']
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    // Update each block's order
    for (const { id, order } of blockOrders) {
      await this.blockRepository.update(id, { order });
    }

    // Return updated blocks
    return await this.findAll(moduleId);
  }
}