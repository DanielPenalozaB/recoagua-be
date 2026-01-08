import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Module } from "./entities/module.entity";
import { Guide } from "../guides/entities/guide.entity";
import { CreateModuleDto2 } from "./dto/create-module.dto";
import { UpdateModuleDto } from "./dto/update-module.dto";

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(Guide)
    private readonly guideRepository: Repository<Guide>
  ) {}

  async create(CreateModuleDto2: CreateModuleDto2): Promise<Module> {
    const guide = await this.guideRepository.findOne({
      where: { id: CreateModuleDto2.guideId },
    });

    if (!guide) {
      throw new NotFoundException(
        `Guide with ID ${CreateModuleDto2.guideId} not found`
      );
    }

    // Check for duplicate order within the same guide
    const existingModule = await this.moduleRepository.findOne({
      where: {
        guide: { id: CreateModuleDto2.guideId },
        order: CreateModuleDto2.order,
      },
    });

    if (existingModule) {
      throw new BadRequestException(
        `Module with order ${CreateModuleDto2.order} already exists in this guide`
      );
    }

    const module = this.moduleRepository.create({
      ...CreateModuleDto2,
      guide,
    });

    return await this.moduleRepository.save(module);
  }

  async findAll(guideId?: number): Promise<Module[]> {
    const queryBuilder = this.moduleRepository
      .createQueryBuilder("module")
      .leftJoinAndSelect("module.guide", "guide")
      .leftJoinAndSelect("module.blocks", "blocks")
      .orderBy("module.order", "ASC")
      .addOrderBy("blocks.order", "ASC");

    if (guideId) {
      queryBuilder.where("guide.id = :guideId", { guideId });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Module> {
    const module = await this.moduleRepository
      .createQueryBuilder("module")
      .leftJoinAndSelect("module.guide", "guide")
      .leftJoinAndSelect("module.blocks", "blocks")
      .leftJoinAndSelect("blocks.answers", "answers")
      .leftJoinAndSelect("blocks.relationalPairs", "pairs")
      .where("module.id = :id", { id })
      .orderBy("blocks.order", "ASC")
      .addOrderBy("answers.order", "ASC")
      .getOne();

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return module;
  }

  async update(id: number, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const module = await this.findOne(id);

    // Check for duplicate order if order is being updated
    if (updateModuleDto.order && updateModuleDto.order !== module.order) {
      const existingModule = await this.moduleRepository.findOne({
        where: {
          guide: { id: module.guide.id },
          order: updateModuleDto.order,
        },
      });

      if (existingModule && existingModule.id !== id) {
        throw new BadRequestException(
          `Module with order ${updateModuleDto.order} already exists in this guide`
        );
      }
    }

    Object.assign(module, updateModuleDto);
    return await this.moduleRepository.save(module);
  }

  async remove(id: number): Promise<void> {
    const module = await this.findOne(id);
    await this.moduleRepository.softDelete(id);
  }

  async reorderModules(
    guideId: number,
    moduleOrders: { id: number; order: number }[]
  ): Promise<Module[]> {
    const guide = await this.guideRepository.findOne({
      where: { id: guideId },
      relations: ["modules"],
    });

    if (!guide) {
      throw new NotFoundException(`Guide with ID ${guideId} not found`);
    }

    // Update each module's order
    for (const { id, order } of moduleOrders) {
      await this.moduleRepository.update(id, { order });
    }

    // Return updated modules
    return await this.findAll(guideId);
  }
}
