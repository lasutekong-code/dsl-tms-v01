# dsl-tms-v01

DSL TMS 로그인/대시보드 최소 구현입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000/login`으로 접속합니다.

## 환경 변수

`.env.local` 파일에 Supabase 프로젝트 정보를 설정합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 로그인 흐름

1. `/login`에서 이메일/비밀번호로 로그인합니다.
2. 로그인 성공 후 Supabase `profiles` 테이블을 조회합니다.
3. 로그인한 사용자 ID와 같은 `profiles.id` 행의 `role` 값을 확인합니다.
4. `role`이 있으면 `/dashboard`로 이동합니다.

`profiles` 테이블은 최소한 다음 컬럼을 포함해야 합니다.

| column | description |
| --- | --- |
| `id` | Supabase Auth 사용자 ID |
| `role` | 사용자의 권한/역할 |
