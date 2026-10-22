import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Maps database errors to meaningful HTTP responses instead of a generic 500.
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.warn(exception.message.split('\n').pop());
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ statusCode: 400, message: 'Données invalides ou champ obligatoire manquant' });
    }

    switch (exception.code) {
      case 'P2002':
        return res
          .status(HttpStatus.CONFLICT)
          .json({ statusCode: 409, message: 'Un élément avec cette valeur existe déjà' });
      case 'P2003':
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ statusCode: 400, message: 'Référence invalide (élément lié introuvable)' });
      case 'P2025':
        return res.status(HttpStatus.NOT_FOUND).json({ statusCode: 404, message: 'Élément introuvable' });
      default:
        this.logger.error(`${exception.code}: ${exception.message}`);
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ statusCode: 500, message: 'Erreur serveur' });
    }
  }
}
