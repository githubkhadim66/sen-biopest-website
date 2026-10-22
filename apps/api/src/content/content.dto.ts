import {
  IsBoolean,
  Matches,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class UpsertBlockDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() linkUrl?: string;
  @IsOptional() @IsString() linkText?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CreateFaqDto {
  @IsString() @MaxLength(500) question: string;
  @IsString() @MaxLength(5000) answer: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}

export class CreateTestimonialDto {
  @IsString() @MaxLength(120) authorName: string;
  @IsOptional() @IsString() authorRole?: string;
  @IsOptional() @IsString() authorLocation?: string;
  @IsString() @MaxLength(2000) content: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}

export class UpsertSettingDto {
  @IsString() @MaxLength(1000) value: string;
  @IsOptional() @IsString() label?: string;
}

export class BulkSettingsDto {
  /** { whatsapp_number: "+221…", company_email: "…" } */
  @IsObject() values: Record<string, string>;
}

export class TrackClickDto {
  /** e.g. whatsapp, whatsapp_product, demander_devis, view_product */
  @Matches(/^[a-z_]{2,50}$/)
  ctaType: string;

  @IsString() @MaxLength(300) page: string;

  @IsOptional() @IsString() @MaxLength(200) productSlug?: string;
}
