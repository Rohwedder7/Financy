import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { displayCategoryName } from '../category-name.js';
import { HEX_COLOR_PATTERN, toOptionalHexColor } from '../hex-color.js';

@InputType()
export class UpdateCategoryInput {
  @Field({ nullable: true })
  @Transform(({ value }) => (typeof value === 'string' ? displayCategoryName(value) : value))
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => toOptionalHexColor(value))
  @ValidateIf((_, value) => value != null)
  @Matches(HEX_COLOR_PATTERN, { message: 'color must be a #RRGGBB hex value' })
  color?: string | null;
}
