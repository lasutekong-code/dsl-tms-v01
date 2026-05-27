import { AccountRequestForm } from "@/components/auth/account-request-form";

export default function SignupPage() {
  return (
    <AccountRequestForm
      mode="signup"
      title="신규 가입"
      description="가입 신청 후 관리자 승인이 완료되면 로그인할 수 있습니다."
    />
  );
}
