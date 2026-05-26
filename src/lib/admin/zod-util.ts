import { z } from "zod";

export function flattenZodErrors(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    fields[key] ??= [];
    fields[key].push(issue.message);
  }
  return fields;
}

export const optionalTrimmed = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

export const requiredTrimmed = (label: string) => z.string().trim().min(1, `${label}은(는) 필수입니다.`);

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "전화번호는 필수입니다.")
  .regex(/^[\d+\-()\s]{9,20}$/u, "전화번호 형식이 올바르지 않습니다.");

export const phoneOptionalSchema = z
  .string()
  .trim()
  .optional()
  .transform((v) => (!v ? null : v))
  .pipe(
    z.union([
      z.null(),
      z.string().regex(/^[\d+\-()\s]{9,20}$/u, "전화번호 형식이 올바르지 않습니다."),
    ]),
  );

export const dateYmdSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜는 YYYY-MM-DD 형식이어야 합니다.");

export const dateYmdOptionalSchema = z
  .string()
  .trim()
  .optional()
  .transform((v) => (!v ? null : v))
  .pipe(
    z.union([z.null(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜는 YYYY-MM-DD 형식이어야 합니다.")]),
  );

export const uuidString = z.string().uuid("올바른 ID가 아닙니다.");

export const nonNegativeNumber = z.coerce.number().finite().nonnegative("0 이상이어야 합니다.");

export const nonNegativeIntOptional = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.coerce.number().int().nonnegative().nullable().optional(),
);

export function normalizeBusinessNo(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const digits = value.replace(/[^\d]/g, "");
  return digits.length ? digits : null;
}

export function formatKoreanBusinessNo(digits: string): string {
  if (digits.length !== 10) {
    return digits;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export const businessNoSchema = z
  .string()
  .trim()
  .min(1, "사업자등록번호는 필수입니다.")
  .refine((v) => {
    const d = normalizeBusinessNo(v);
    return d !== null && d.length === 10;
  }, "사업자등록번호는 10자리 숫자여야 합니다.");

export const businessNoOptionalSchema = z
  .string()
  .trim()
  .optional()
  .transform((v) => (!v ? null : v))
  .pipe(
    z.union([
      z.null(),
      z.string().refine(
        (v) => {
          const d = normalizeBusinessNo(v);
          return d !== null && d.length === 10;
        },
        { message: "사업자등록번호는 10자리 숫자여야 합니다." },
      ),
    ]),
  );
