import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminOk } from "@/lib/admin/api-guard";
import { insertAuditLog } from "@/lib/admin/audit-log";
import { buildAsciiStoragePath } from "@/lib/admin/storage-path";
import { uploadAdminStorageObject, removeAdminStorageObject } from "@/lib/admin/storage-upload";
import type { Database } from "@/types/database";

export const CONTRACT_FILE_BUCKET = "contract-files";
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "hwpx", "txt"]);

type Supabase = SupabaseClient<Database>;

export function contractFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isAllowedContractFileName(fileName: string) {
  return ALLOWED_EXTENSIONS.has(contractFileExtension(fileName));
}

export function getUploadFileFromForm(form: FormData) {
  const entry = form.get("file");
  if (entry instanceof File && entry.size > 0) {
    return entry;
  }

  if (entry instanceof Blob && entry.size > 0) {
    const name = typeof (entry as File).name === "string" ? (entry as File).name : "contract-file";
    return new File([entry], name);
  }

  return null;
}

export async function uploadContractFile(
  supabase: Supabase,
  contractId: string,
  file: File,
  gate: AdminOk,
) {
  const ext = contractFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { error: "pdf, docx, hwpx, txt 파일만 업로드할 수 있습니다." as const };
  }

  const path = buildAsciiStoragePath(contractId, ext);
  const { error: uploadError } = await uploadAdminStorageObject(
    CONTRACT_FILE_BUCKET,
    path,
    Buffer.from(await file.arrayBuffer()),
    file.type || "application/octet-stream",
  );
  if (uploadError) {
    console.error("contract file storage upload failed", uploadError.message);
    const detail = uploadError.message?.trim();
    return {
      error: detail
        ? `파일 업로드에 실패했습니다. (${detail})`
        : ("파일 업로드에 실패했습니다. SUPABASE_SERVICE_ROLE_KEY 설정을 확인해 주세요." as const),
    };
  }

  const { data, error } = await supabase
    .from("contracts")
    .update({
      contract_file_bucket: CONTRACT_FILE_BUCKET,
      contract_file_path: path,
      contract_file_name: file.name,
      contract_file_mime: file.type || null,
    })
    .eq("id", contractId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return { error: "파일 정보 저장에 실패했습니다." as const };
  }

  await insertAuditLog(supabase, {
    profileId: gate.profileId,
    userId: gate.userId,
    action: "contract.file.upload",
    targetTable: "contracts",
    targetId: contractId,
    vehicleId: data.vehicle_id,
    metadata: { file_name: file.name },
  });

  return { data };
}

export async function deleteContractFile(supabase: Supabase, contractId: string, gate: AdminOk) {
  const { data: existing } = await supabase
    .from("contracts")
    .select("id, vehicle_id, contract_file_bucket, contract_file_path")
    .eq("id", contractId)
    .maybeSingle();

  if (!existing) {
    return { error: "계약을 찾을 수 없습니다." as const, status: 404 as const };
  }

  if (existing.contract_file_bucket && existing.contract_file_path) {
    await removeAdminStorageObject(existing.contract_file_bucket, existing.contract_file_path);
  }

  const { data, error } = await supabase
    .from("contracts")
    .update({
      contract_file_bucket: null,
      contract_file_path: null,
      contract_file_name: null,
      contract_file_mime: null,
    })
    .eq("id", contractId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return { error: "첨부파일 삭제에 실패했습니다." as const, status: 500 as const };
  }

  await insertAuditLog(supabase, {
    profileId: gate.profileId,
    userId: gate.userId,
    action: "contract.file.delete",
    targetTable: "contracts",
    targetId: contractId,
    vehicleId: data.vehicle_id,
  });

  return { data };
}
