# dsl-tms-v01

운송회사 차량관리 웹앱 — Next.js App Router + Supabase + shadcn/ui

## 기술 스택

- Next.js App Router, TypeScript, Tailwind CSS
- shadcn/ui (Button, Input, Label, Card, Alert)
- Supabase Auth + PostgreSQL + RLS
- Vercel 배포 예정

## 인증 · 역할

로그인은 Supabase Auth (`signInWithPassword`) 후 `public.profiles`에서 조회합니다.

| role | 로그인 후 이동 |
|------|----------------|
| admin | `/admin/vehicles` |
| client_manager, owner, driver, staff | `/search` |

`profiles` 컬럼: `id`, `role`, `name`, `phone`, `email`, `is_active`, `created_at`, `updated_at`

## 시작하기

```bash
cp .env.example .env.local
npm install
npm run dev
```

- 로그인: http://localhost:3000/login
- role 라우팅 허브: `/dashboard`

## 주요 경로

| 파일 | 역할 |
|------|------|
| `src/app/login/page.tsx` | 로그인 화면 (서버) |
| `src/components/login/login-form.tsx` | 로그인 폼 (클라이언트) |
| `src/lib/auth/get-profile.ts` | 프로필 조회 |
| `src/app/dashboard/page.tsx` | role별 redirect |
| `src/components/layout/app-header.tsx` | 공통 헤더 |
