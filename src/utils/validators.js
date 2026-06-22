import { z } from 'zod';
import ms from 'ms';

export const reasonSchema = z
  .string()
  .min(3,   'Reason must be at least 3 characters.')
  .max(512, 'Reason cannot exceed 512 characters.')
  .default('No reason provided.');

export const durationSchema = z
  .string()
  .refine(
    (v) => {
      const parsed = ms(v);
      return typeof parsed === 'number' && parsed > 0;
    },
    { message: 'Invalid duration. Use formats like 10m, 2h, 1d.' }
  )
  .transform((v) => ({ raw: v, ms: ms(v) }));

export const warnSchema = z.object({
  user:   z.string().min(1),
  reason: reasonSchema,
});

export const muteSchema = z.object({
  user:     z.string().min(1),
  duration: durationSchema,
  reason:   reasonSchema,
});

export const kickSchema = z.object({
  user:   z.string().min(1),
  reason: reasonSchema,
});

export const pollSchema = z.object({
  question: z.string().min(5,  'Question must be at least 5 characters.').max(256),
  options:  z
    .string()
    .transform((v) =>
      v.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    )
    .pipe(
      z.array(z.string().min(1))
        .min(2,  'Provide at least 2 options.')
        .max(10, 'Maximum 10 options allowed.')
    ),
});

export const giveawaySchema = z.object({
  prize:    z.string().min(1).max(256),
  duration: durationSchema,
  winners:  z.number().int().min(1).max(20).default(1),
});


export function validate(schema, input) {
  const result = schema.safeParse(input);
  if (result.success) return { data: result.data };
  const msg = result.error.errors.map((e) => e.message).join(' · ');
  return { error: msg };
}
