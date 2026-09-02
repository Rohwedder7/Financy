import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { GqlAuthGuard } from '../auth/gql-auth.guard.js';
import type { UserModel } from '../auth/models/user.model.js';
import { CategoryService } from './category.service.js';
import { CreateCategoryInput } from './dto/create-category.input.js';
import { UpdateCategoryInput } from './dto/update-category.input.js';
import { CategoryModel } from './models/category.model.js';

@UseGuards(GqlAuthGuard)
@Resolver(() => CategoryModel)
export class CategoryResolver {
  constructor(private readonly categories: CategoryService) {}

  @Query(() => [CategoryModel], {
    description: 'Categories owned by the authenticated user.',
    name: 'categories',
  })
  listCategories(@CurrentUser() user: UserModel): Promise<CategoryModel[]> {
    return this.categories.list(user.id);
  }

  @Mutation(() => CategoryModel, { description: 'Creates a category for the authenticated user.' })
  createCategory(
    @CurrentUser() user: UserModel,
    @Args('input') input: CreateCategoryInput,
  ): Promise<CategoryModel> {
    return this.categories.create(user.id, input);
  }

  @Mutation(() => CategoryModel, { description: 'Updates a category owned by the authenticated user.' })
  updateCategory(
    @CurrentUser() user: UserModel,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCategoryInput,
  ): Promise<CategoryModel> {
    return this.categories.update(user.id, id, input);
  }

  @Mutation(() => Boolean, { description: 'Deletes a category that has no transactions.' })
  deleteCategory(
    @CurrentUser() user: UserModel,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.categories.remove(user.id, id);
  }
}
