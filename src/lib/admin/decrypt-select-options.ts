import { decryptPii } from "@/lib/crypto/pii";

export function decryptDriverSelectOptions(rows: { id: string; driver_name: string | null }[]) {
  return rows.map((row) => ({
    id: row.id,
    driver_name: decryptPii(row.driver_name) ?? row.driver_name ?? "",
  }));
}

export function decryptOwnerSelectOptions(rows: { id: string; owner_name: string | null }[]) {
  return rows.map((row) => ({
    id: row.id,
    owner_name: decryptPii(row.owner_name) ?? row.owner_name ?? "",
  }));
}
