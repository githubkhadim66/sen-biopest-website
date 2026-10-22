import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

/**
 * Normalises blank strings sent by forms:
 * - in bodies, "" becomes `null`: optional fields left blank (e.g. email: "") pass
 *   `@IsOptional()` instead of failing `@IsEmail()`, and clearing a field in an
 *   edit form really clears it in the database;
 * - in query strings, "" becomes `undefined` so pagination defaults still apply.
 */
@Injectable()
export class BlankStringsPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query') return value;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;

    const blank = metadata.type === 'body' ? null : undefined;
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === 'string') {
        const trimmed = v.trim();
        out[key] = trimmed === '' ? blank : trimmed;
      } else {
        out[key] = v;
      }
    }
    return out;
  }
}
