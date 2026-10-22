import { IsString, IsOptional, IsBoolean, IsEnum, IsEmail, IsArray, ArrayMaxSize, Matches } from 'class-validator';
import { TechnicalRequestStatus, ActorType } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateTechnicalRequestDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsEnum(ActorType)
  actorType: ActorType;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsString()
  crop: string;

  @IsOptional()
  @IsString()
  cropStage?: string;

  @IsString()
  symptoms: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  consent: boolean;

  /** URLs returned by POST /uploads/single */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @Matches(/^\/uploads\/[\w.-]+$/, { each: true })
  photos?: string[];
}

export class UpdateTechnicalRequestStatusDto {
  @IsEnum(TechnicalRequestStatus)
  status: TechnicalRequestStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class AddTechnicalNoteDto {
  @IsString()
  content: string;
}

export class TechnicalRequestQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TechnicalRequestStatus)
  status?: TechnicalRequestStatus;

  @IsOptional()
  @IsString()
  region?: string;
}
