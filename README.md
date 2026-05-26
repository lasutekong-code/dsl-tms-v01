# dsl-tms-v01

DSL 운송 관리 시스템 (TMS) — Next.js + Tailwind + Supabase

## 기능

- **로그인** (`/login`): 업무용 이메일/비밀번호 로그인, 모바일 대응 UI
- **역할 기반 접근**: `users.role` — admin, manager, dispatcher, driver, viewer
- **운전자 사진**: `drivers.photo_path` → Storage signed URL
- **민감정보**: `driver_license_number`, `birth_date`, `address`는 admin/manager만 표시

## DB 컬럼명

앱 코드는 `supabase/migrations/` 스키마의 컬럼명을 그대로 사용합니다.

| 테이블 | 주요 컬럼 |
|--------|-----------|
| `users` | `auth_user_id`, `email`, `role`, `is_active` |
| `drivers` | `full_name`, `driver_license_number`, `birth_date`, `address`, `photo_path` |

## 시작하기

```bash
cp .env.example .env.local
# Supabase URL / anon key 설정 후
npm install
npm run dev
```

마이그레이션은 Supabase CLI 또는 SQL Editor에서 `supabase/migrations/20250525000000_initial_schema.sql` 실행.

`auth.users`와 `public.users`를 연동하려면 동일 이메일로 `users.auth_user_id`를 채워 주세요.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint
