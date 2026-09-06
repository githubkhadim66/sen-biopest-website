import { IsString, IsOptional, IsBoolean, IsEnum, IsEmail } from 'class-validator';
import { TechnicalRequestStatus, ActorType } from '@prisma/client';

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
