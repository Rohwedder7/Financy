import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { DatabaseService } from '../database/database.service.js';
import { normalizeCategoryName } from './category-name.js';
import type { CreateCategoryInput } from './dto/create-category.input.js';
import type { UpdateCategoryInput } from './dto/update-category.input.js';
import type { CategoryModel } from './models/category.model.js';
import { PUBLIC_CATEGORY_FIELDS } from './public-category.js';

const UNIQUE_CONSTRAINT = 'P2002';
const RECORD_NOT_FOUND = 'P2025';

function isPrismaCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function notFound(): GraphQLError {
  return new GraphQLError('Category not found.', {
    extensions: { code: 'NOT_FOUND', safe: true },
  });
}

function conflict(): GraphQLError {
  return new GraphQLError('A category with this name already exists.', {
    extensions: { code: 'CONFLICT', safe: true },
  });
}

function inUse(): GraphQLError {
  return new GraphQLError('This category still has transactions.', {
    extensions: { code: 'CATEGORY_IN_USE', safe: true },
  });
}

@Injectable()
export class CategoryService {
  constructor(private readonly database: DatabaseService) {}

  list(userId: string): Promise<CategoryModel[]> {
    return this.database.category.findMany({
      orderBy: [{ normalizedName: 'asc' }, { createdAt: 'asc' }],
      select: PUBLIC_CATEGORY_FIELDS,
      where: { userId },
    });
  }

  async create(userId: string, input: CreateCategoryInput): Promise<CategoryModel> {
    try {
      return await this.database.category.create({
        data: {
          color: input.color ?? null,
          name: input.name,
          normalizedName: normalizeCategoryName(input.name),
          userId,
        },
        select: PUBLIC_CATEGORY_FIELDS,
      });
    } catch (error) {
      if (isPrismaCode(error, UNIQUE_CONSTRAINT)) {
        throw conflict();
      }

      throw error;
    }
  }

  async update(userId: string, id: string, input: UpdateCategoryInput): Promise<CategoryModel> {
    const data: { color?: string | null; name?: string; normalizedName?: string } = {};

    if (input.name !== undefined) {
      data.name = input.name;
      data.normalizedName = normalizeCategoryName(input.name);
    }

    if (input.color !== undefined) {
      data.color = input.color;
    }

    try {
      return await this.database.category.update({
        data,
        select: PUBLIC_CATEGORY_FIELDS,
        where: { id_userId: { id, userId } },
      });
    } catch (error) {
      if (isPrismaCode(error, RECORD_NOT_FOUND)) {
        throw notFound();
      }

      if (isPrismaCode(error, UNIQUE_CONSTRAINT)) {
        throw conflict();
      }

      throw error;
    }
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const owned = await this.database.category.findUnique({
      select: { id: true, _count: { select: { transactions: true } } },
      where: { id_userId: { id, userId } },
    });

    if (!owned) {
      throw notFound();
    }

    if (owned._count.transactions > 0) {
      throw inUse();
    }

    await this.database.category.delete({
      where: { id_userId: { id, userId } },
    });

    return true;
  }
}
