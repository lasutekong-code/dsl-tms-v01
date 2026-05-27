import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  businessNoOptionalSchema,
  dateYmdOptionalSchema,
  optionalNullableTrimmedString,
  optionalUuidSchema,
  phoneOptionalSchema,
} from "@/lib/admin/zod-util";

describe("admin zod schemas accept JSON null", () => {
  it("phoneOptionalSchema", () => {
    assert.equal(phoneOptionalSchema.parse(null), null);
    assert.equal(phoneOptionalSchema.parse(""), null);
    assert.equal(phoneOptionalSchema.parse("02-1234-5678"), "02-1234-5678");
  });

  it("businessNoOptionalSchema", () => {
    assert.equal(businessNoOptionalSchema.parse(null), null);
    assert.equal(businessNoOptionalSchema.parse("123-45-67890"), "123-45-67890");
  });

  it("dateYmdOptionalSchema", () => {
    assert.equal(dateYmdOptionalSchema.parse(null), null);
    assert.equal(dateYmdOptionalSchema.parse("2024-01-15"), "2024-01-15");
  });

  it("optionalNullableTrimmedString", () => {
    assert.equal(optionalNullableTrimmedString.parse(null), null);
    assert.equal(optionalNullableTrimmedString.parse("  memo "), "memo");
  });

  it("optionalUuidSchema", () => {
    assert.equal(optionalUuidSchema.parse(null), null);
    assert.equal(
      optionalUuidSchema.parse("550e8400-e29b-41d4-a716-446655440000"),
      "550e8400-e29b-41d4-a716-446655440000",
    );
  });
});
