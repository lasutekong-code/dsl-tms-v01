import { decryptPii, encryptPii } from "@/lib/crypto/pii";
import type { AddressRow, DriverRow, OwnerRow } from "@/types/database";

function enc(value: string | null | undefined) {
  return encryptPii(value ?? null);
}

function dec(value: string | null | undefined) {
  return decryptPii(value ?? null);
}

export function encryptDriverWrite(row: Record<string, unknown>): Record<string, unknown> {
  const next = { ...row };
  if (typeof next.driver_name === "string") next.driver_name = enc(next.driver_name);
  if (typeof next.phone === "string") next.phone = enc(next.phone);
  if (typeof next.driver_license_no === "string" || next.driver_license_no === null) {
    next.driver_license_no = enc(next.driver_license_no as string | null);
  }
  if (typeof next.cargo_license_no === "string" || next.cargo_license_no === null) {
    next.cargo_license_no = enc(next.cargo_license_no as string | null);
  }
  if (typeof next.resident_registration_number === "string" || next.resident_registration_number === null) {
    next.resident_registration_number = enc(next.resident_registration_number as string | null);
  }
  if (typeof next.birth_date === "string" || next.birth_date === null) {
    next.birth_date = enc(next.birth_date as string | null);
  }
  return next;
}

export function decryptDriverRow(row: DriverRow): DriverRow {
  return {
    ...row,
    driver_name: dec(row.driver_name) ?? row.driver_name,
    phone: dec(row.phone),
    driver_license_no: dec(row.driver_license_no),
    cargo_license_no: dec(row.cargo_license_no),
    resident_registration_number: dec(row.resident_registration_number ?? null),
    birth_date: dec(row.birth_date as string | null),
  };
}

export function encryptOwnerWrite(row: Record<string, unknown>): Record<string, unknown> {
  const next = { ...row };
  if (typeof next.owner_name === "string") next.owner_name = enc(next.owner_name);
  if (typeof next.owner_phone === "string") next.owner_phone = enc(next.owner_phone);
  if (typeof next.business_no === "string" || next.business_no === null) {
    next.business_no = enc(next.business_no as string | null);
  }
  if (typeof next.business_start_date === "string" || next.business_start_date === null) {
    next.business_start_date = enc(next.business_start_date as string | null);
  }
  if (typeof next.business_closed_date === "string" || next.business_closed_date === null) {
    next.business_closed_date = enc(next.business_closed_date as string | null);
  }
  return next;
}

export function decryptOwnerRow(row: OwnerRow): OwnerRow {
  return {
    ...row,
    owner_name: dec(row.owner_name) ?? row.owner_name,
    owner_phone: dec(row.owner_phone),
    business_no: dec(row.business_no),
    business_start_date: dec(row.business_start_date as string | null),
    business_closed_date: dec(row.business_closed_date as string | null),
  };
}

export function encryptAddressWrite(row: Record<string, unknown>): Record<string, unknown> {
  const next = { ...row };
  if ("zip_code" in next) next.zip_code = enc(next.zip_code as string | null);
  if ("address1" in next) next.address1 = enc(next.address1 as string | null);
  if ("address2" in next) next.address2 = enc(next.address2 as string | null);
  return next;
}

export function decryptAddressRow(row: AddressRow): AddressRow {
  return {
    ...row,
    zip_code: dec(row.zip_code),
    address1: dec(row.address1),
    address2: dec(row.address2),
  };
}
