import { AccountRequestForm } from "@/components/auth/account-request-form";

export default function FindIdPage() {
  return (
    <AccountRequestForm
      mode="find_id"
      title="아이디 찾기"
      description="등록 정보를 입력하면 관리자가 확인합니다. 계정이 없으면 신규 가입을 안내합니다."
    />
  );
}
