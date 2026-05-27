import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultNext?: string | null;
};

export function LoginForm({ action, defaultNext }: LoginFormProps) {
  return (
    <form action={action} className="stack">
      {defaultNext ? <input type="hidden" name="next" value={defaultNext} /> : null}
      <label className="stack" style={{ gap: 6 }}>
        <span style={{ fontWeight: 700 }}>이메일</span>
        <Input name="email" placeholder="name@example.com" required type="email" />
      </label>
      <label className="stack" style={{ gap: 6 }}>
        <span style={{ fontWeight: 700 }}>비밀번호</span>
        <Input name="password" placeholder="비밀번호" required type="password" />
      </label>
      <Button type="submit">로그인</Button>
    </form>
  );
}
