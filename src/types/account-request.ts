export type AccountRequestType = "signup" | "find_id" | "find_password";

export type AccountRequestStatus = "pending" | "approved" | "rejected" | "completed";

export type AccountRequestRow = {
  id: string;
  request_type: AccountRequestType;
  email: string;
  name: string | null;
  phone: string | null;
  role: string | null;
  login_id: string | null;
  message: string | null;
  status: AccountRequestStatus;
  profile_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};
