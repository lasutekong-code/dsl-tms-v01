# dsl-tms-v01

운송회사 차량관리 웹앱 (Next.js App Router + Supabase)

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth / PostgreSQL / RLS

## 환경 변수

`.env.local` 파일에 아래 값을 설정하세요.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 개발 서버

```bash
npm install
npm run dev
```

로그인 화면: http://localhost:3000/login

## 역할별 이동 경로

| role | 경로 |
|------|------|
| admin | /admin/vehicles |
| client_manager, owner, driver, staff | /search |
