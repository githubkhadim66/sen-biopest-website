import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsEmail,
  IsArray,
  IsInt,
  IsDateString,
} from 'class-validator';
import { TrainingModality, RegistrationStatus, ActorType } from '@prisma/client';

export class CreateTrainingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @IsString()
  targetAudience: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsEnum(TrainingModality)
  modality: TrainingModality;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsInt()
  maxParticipants?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class UpdateTrainingDto extends CreateTrainingDto {}

export class CreateRegistrationDto {
  @IsString()
  trainingId: string;

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
  motivation?: string;

  @IsBoolean()
  consent: boolean;
}

export class UpdateRegistrationStatusDto {
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;
}
