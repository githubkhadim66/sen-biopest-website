import { IsString, IsOptional, IsBoolean, IsEnum, IsEmail } from 'class-validator';
import { PartnerType, PartnershipStatus } from '@prisma/client';

export class CreatePartnershipRequestDto {
  @IsEnum(PartnerType)
  partnerType: PartnerType;

  @IsString()
  organizationName: string;

  @IsString()
  contactName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsString()
  proposal: string;

  @IsOptional()
  @IsString()
  objectives?: string;

  @IsBoolean()
  consent: boolean;
}

export class UpdatePartnershipStatusDto {
  @IsEnum(PartnershipStatus)
  status: PartnershipStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class AddPartnershipNoteDto {
  @IsString()
  content: string;
}
