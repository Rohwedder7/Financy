import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { displayCategoryName } from '../category-name.js';
import { HEX_COLOR_PATTERN, toOptionalHexColor } from '../hex-color.js';

/** BR-SEC-004: category writes never accept `userId`; ownership comes from the JWT. */
@InputType()
export class CreateCategoryInput {
  @Field()
  @Transform(({ value }) => (typeof value === 'string' ? displayCategoryName(value) : value))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => toOptionalHexColor(value))
  @ValidateIf((_, value) => value != null)
  @Matches(HEX_COLOR_PATTERN, { message: 'color must be a #RRGGBB hex value' })
  color?: string | null;
}
