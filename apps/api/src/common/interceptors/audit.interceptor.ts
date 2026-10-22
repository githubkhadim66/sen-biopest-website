import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

const ACTIONS: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

/**
 * Records every successful write made by an authenticated back-office user in
 * the audit_logs table. Public form submissions (no user) are not logged.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { user?: { id: string } }>();
    const action = ACTIONS[req.method];
    if (!action) return next.handle();

    return next.handle().pipe(
      tap((result) => {
        const userId = req.user?.id;
        if (!userId) return;

        // /api/admin/products/:id -> entityType "products"
        const segments = req.path.replace(/^\/api\//, '').split('/').filter(Boolean);
        const entityType = segments[0] === 'admin' ? segments[1] : segments[0];
        const entityId =
          (req.params?.id as string | undefined) ??
          (result && typeof result === 'object' && 'id' in result ? String((result as { id: unknown }).id) : '-');

        this.prisma.auditLog
          .create({
            data: {
              action,
              entityType: entityType || 'unknown',
              entityId,
              userId,
              details: { method: req.method, path: req.path },
            },
          })
          .catch((err) => this.logger.warn(`Audit log failed: ${err.message}`));
      }),
    );
  }
}
