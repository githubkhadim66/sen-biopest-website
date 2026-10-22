import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsEmail,
} from 'class-validator';
import {
  CommercialRequestType,
  CommercialRequestStatus,
  ActorType,
} from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateCommercialRequestDto {
  @IsEnum(CommercialRequestType)
  type: CommercialRequestType;

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

  @IsOptional()
  @IsString()
  productInterest?: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  cropConcerned?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsBoolean()
  consent: boolean;

  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateCommercialRequestStatusDto {
  @IsEnum(CommercialRequestStatus)
  status: CommercialRequestStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class AddNoteDto {
  @IsString()
  content: string;
}

export class CommercialRequestQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CommercialRequestStatus)
  status?: CommercialRequestStatus;

  @IsOptional()
  @IsEnum(CommercialRequestType)
  type?: CommercialRequestType;

  @IsOptional()
  @IsString()
  region?: string;
}
