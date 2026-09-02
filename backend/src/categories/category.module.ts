import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CategoryResolver } from './category.resolver.js';
import { CategoryService } from './category.service.js';

@Module({
  imports: [AuthModule],
  providers: [CategoryResolver, CategoryService],
})
export class CategoryModule {}
