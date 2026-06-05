# AGENTS.md

이 문서는 `dsl-tms-v01` 프로젝트에서 AI 코딩 에이전트(Cursor, Claude Code, GitHub Copilot 등) 및 협업자가 따라야 할 규칙·패턴·함정을 정리한 것입니다.

**작업을 시작하기 전에 이 문서를 반드시 먼저 읽으십시오.**

---

## 프로젝트 개요

- **이름**: 동서물류 TMS (콜화물앱 관리자)
- **기술 스택**: Next.js 16.2.6 (App Router) + TypeScript + Supabase + Vercel
- **배포 환경**:
  - Production: `dsl-tms-v01.vercel.app`
  - Region: Vercel `icn1` (Seoul) / Supabase `ap-northeast-2` (Seoul)
- **저장소**: `lasutekong-code/dsl-tms-v01`
- **언어**: 코드와 식별자는 영문, 주석과 UI 텍스트는 한글 (UTF-8)

---

## 🚨 절대 규칙 (Critical Rules)

이 규칙들은 한 번이라도 어기면 시스템이 즉시 마비됩니다.

### Rule 1: 다음 파일들은 절대 삭제·이동·이름 변경 금지

| 파일 | 역할 | 누락 시 증상 |
|---|---|---|
| `middleware.ts` (루트) | Supabase 세션 토큰 갱신 | 모든 페이지가 /login으로 307 리다이렉트 |
| `next-env.d.ts` | Next.js 타입 정의 (자동 생성, 커밋 필수) | TypeScript 컴파일 오류 |
| `next.config.ts` | Next.js 설정 | 빌드 실패 |
| `src/lib/supabase/server.ts` | Server Component용 Supabase client | 인증 깨짐 |
| `src/lib/auth/get-profile.ts` | `requireProfile()` 정의 | 모든 보호 페이지 동작 불가 |
| `package.json` | 의존성 정의 | 빌드 실패 |
| `tsconfig.json` | TypeScript 설정 | 컴파일 오류 |

### Rule 2: 다음 패턴은 임의 변경 금지

- 모든 admin 페이지(`src/app/admin/**/page.tsx`)와 보호 페이지의 `export const dynamic = "force-dynamic"` (제거 시 정적 생성되어 쿠키 못 읽음)
- Server Component에서 `searchParams`, `params`는 반드시 `await` 처리 (Next.js 16 규약)
- `middleware.ts` 내 `supabase.auth.getUser()` 호출 (이게 세션 갱신의 핵심)
- `app/page.tsx`의 환경 변수 체크 로직

### Rule 3: 작업 범위는 명시적으로 제한

AI 도구 작업 후 **반드시** 아래 명령으로 변경 범위 확인:

```bash
git diff --stat
```

작업 지시에 없던 파일이 보이면 **그 브랜치는 main에 절대 머지하지 마십시오.** 원인 파악이 우선입니다.

---

## AI 에이전트 작업 지시 템플릿

작업을 의뢰할 때는 다음 형식을 권장합니다.

```
다음 N개 파일만 수정하세요:
1. [경로/파일1]
2. [경로/파일2]
...

수정 내용:
- [구체적 변경 사항]

다음은 절대 수정·삭제 금지:
- middleware.ts
- next-env.d.ts
- next.config.ts
- package.json
- tsconfig.json
- 작업 범위 외의 모든 파일 (AGENTS.md, README.md, .tsx, .ts 등)

작업 완료 후 git diff --stat 결과를 보고하세요.
변경 파일이 위 N개를 초과하면 작업을 중단하고 사용자에게 보고하세요.
```

---

## 아키텍처 핵심

### 인증 흐름

1. 사용자가 페이지 요청
2. `middleware.ts`가 가로채서 Supabase 세션 토큰 갱신 (`supabase.auth.getUser()`)
3. Server Component가 `createClient()` 호출 → 갱신된 쿠키 읽음
4. `requireProfile()`이 user/profile 확인 → 없으면 `/login` 리다이렉트

→ `middleware.ts`가 없으면 3번 단계에서 만료 토큰을 보고 항상 미인증으로 판단하여 무한 리다이렉트 발생.

### Server Component vs Client Component 사용 기준

- **기본은 Server Component** (인증 검증, DB 조회, 데이터 페칭)
- **Client Component**(`"use client"`)는 다음 경우에만:
  - `useState`, `useEffect` 등 React Hooks 사용
  - 사용자 이벤트 핸들링 (`onClick`, `onSubmit`)
  - `usePathname()`, `useSearchParams()` 등 Client API 사용
  - 브라우저 API(`window`, `localStorage` 등) 사용

### 보호 페이지 표준 패턴

```tsx
// src/app/admin/xxx/page.tsx
import { requireProfile } from "@/lib/auth/get-profile";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic"; // ⚠️ 제거 금지

type PageProps = {
  searchParams?: Promise<{ q?: string; page?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;        // 반드시 await
  const profile = await requireProfile(); // 미인증 시 자동 /login

  return (
    <AppShell profile={profile}>
      {/* 화면 */}
    </AppShell>
  );
}
```

---

## 디렉터리 구조

```
src/
├── app/
│   ├── admin/                    # 관리자 페이지 (인증 필요, force-dynamic 필수)
│   │   ├── drivers/
│   │   ├── owners/
│   │   ├── vehicles/
│   │   ├── assignments/
│   │   ├── insurances/
│   │   ├── inspections/
│   │   ├── contracts/
│   │   └── ...
│   ├── search/                   # 차량 검색 (인증 필요)
│   ├── vehicles/[id]/            # 차량 상세
│   ├── login/                    # 로그인
│   ├── api/                      # API Routes
│   ├── page.tsx                  # 루트 (환경 변수 체크 후 /dashboard 리다이렉트)
│   └── layout.tsx                # 전체 레이아웃
├── components/
│   ├── admin/                    # admin 전용 컴포넌트
│   ├── vehicle/                  # 차량 관련 컴포넌트
│   ├── layout/                   # AppShell 등
│   ├── system/                   # 에러/설정 페이지
│   └── ui/                       # shadcn/ui 기반 공용 UI
├── lib/
│   ├── supabase/                 # Supabase client 설정
│   ├── auth/                     # 인증 헬퍼 (requireProfile 등)
│   ├── format/                   # 포맷팅 함수
│   ├── vehicles/                 # 차량 도메인 헬퍼
│   ├── admin/                    # PII 처리 등
│   └── utils/                    # 공용 유틸
└── types/                        # TypeScript 타입 정의

middleware.ts                     # ⚠️ 루트 (절대 삭제 금지)
next.config.ts
next-env.d.ts
package.json
tsconfig.json
```

---

## 환경 변수

다음 환경 변수는 Vercel의 **Production / Preview / Development 모두**에 동일하게 설정되어야 합니다.

| 변수 | 필수 여부 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ 필수 | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ 필수 | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 관리 기능에 필수 | 서버 측 관리 작업 |
| `FIELD_ENCRYPTION_KEY` | PII 복호화에 필수 | 개인정보 암복호화 |

누락 시 `app/page.tsx`의 `isSupabaseConfigured()` 체크가 실패하여 `ConfigurationErrorPage`가 표시됩니다.

Supabase URL Configuration에는 다음 경로도 등록되어 있어야 합니다.
- `https://<preview-url>.vercel.app/auth/callback`
- `https://<preview-url>.vercel.app/login/reset-password`

---

## Git 워크플로우

### 권장 절차

1. `main`에서 새 브랜치 생성: `git checkout -b fix/이슈명` 또는 `feat/기능명`
2. 작업 후 `git diff --stat`으로 변경 파일 확인 (Rule 3)
3. 의도하지 않은 파일이 보이면 즉시 중단하고 원인 파악
4. 커밋 → 푸시 → Vercel Preview 자동 배포
5. Preview에서 실제 동작 검증
6. PR 생성 → main 머지 → Production 자동 배포

### Vercel Preview 필수 검증 항목

- [ ] 로그인 정상 작동
- [ ] **사이드메뉴 클릭 시 로그인 화면으로 튕기지 않음** (인증 회귀 체크 — 이번 사고의 핵심 증상)
- [ ] 운전자/사업주/차량 관리 → 차량 상세 → "목록으로" 복귀 (검색어·페이지 보존)
- [ ] 차량 검색 → 차량 상세 → "목록으로" → 검색어 자동 복원
- [ ] 한글이 깨지지 않고 정상 표시

---

## 코드 컨벤션

- **언어**: TypeScript strict mode
- **포맷**: Prettier (저장 시 자동 포맷)
- **Imports**: 절대 경로 `@/...` 사용
- **컴포넌트 명명**: PascalCase
- **파일 명명**: kebab-case (예: `vehicle-detail-page.tsx`)
- **한글 UI 텍스트**: UTF-8 인코딩 필수

---

## 알려진 함정 (Known Pitfalls)

### Next.js 16 — `searchParams` / `params`는 Promise

```tsx
// ❌ 잘못된 코드 (Next.js 16에서 크래시)
const from = searchParams.from;

// ✅ 올바른 코드
const sp = await searchParams;
const from = sp?.from;
```

### Supabase SSR — middleware 의존성

Server Component에서 `createClient()` 호출 전, `middleware.ts`가 반드시 토큰을 갱신해야 합니다. → **`middleware.ts` 절대 삭제 금지.**

### 한글 인코딩 — PowerShell 표시 문제

PowerShell `Get-Content`는 기본적으로 시스템 코드페이지(cp949)로 UTF-8 파일을 읽어서 한글이 깨져 보입니다. 실제 파일은 정상일 가능성이 높습니다.

```powershell
# 정상 확인 방법
Get-Content -Encoding UTF8 [파일경로]
```

또는 VS Code/Cursor에서 직접 열어 확인하십시오.

### 오픈 리다이렉트 방어

`?from=...` 같이 URL을 받아 리다이렉트하는 모든 곳에는 화이트리스트 검증을 적용해야 합니다. 예: `src/app/vehicles/[id]/page.tsx`의 `sanitizeBackHref()` 함수.

### `dynamic = "force-dynamic"` 누락

이 export가 빠지면 admin 페이지가 정적 생성되어 쿠키를 읽지 못합니다. 모든 인증 보호 페이지에 필수.

---

## 보안 고려사항

- **PII 데이터**: 운전자/사업주의 개인정보(이름, 전화, 주소 등)는 DB에서 암호화 저장. 조회 시 `decryptDriverRow()`, `decryptOwnerRow()` 등 헬퍼로 복호화. `FIELD_ENCRYPTION_KEY` 환경 변수 필수.
- **Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출 금지. Server Component, Server Action, API Route 내부에서만 사용.
- **외부 URL 리다이렉트**: 사용자 입력 기반 리다이렉트는 반드시 화이트리스트로 검증.

---

## 사고 이력

### 2026-06 — 백 버튼 리팩토링 중 middleware.ts 삭제 사고

- **증상**: 사이드메뉴 클릭 시 로그인 화면으로 튕김
- **원인**: AI 도구(Cursor)가 "차량 상세 목록으로 버튼" 작업 중 `middleware.ts` 및 12개 이상의 기타 파일(주로 `_page.tsx` 형식)을 무관하게 삭제. Server Component의 `getUser()`가 만료된 토큰을 읽어 무한 리다이렉트 발생.
- **해결**: main 기반으로 새 브랜치 생성 후 4개 파일만 정밀 수정 (`admin-vehicle-detail-link.tsx`, `app/vehicles/[id]/page.tsx`, `vehicle-result-card.tsx`, `search-page-client.tsx`)
- **재발 방지**: 본 문서의 Rule 1, Rule 2, Rule 3, "AI 에이전트 작업 지시 템플릿" 신설
- **사고 브랜치**: `archive/cursor-incident-2026-06`로 보존 (분석용)

---

## 추가 참고 자료

- Next.js App Router 공식 문서: https://nextjs.org/docs/app
- Supabase SSR 가이드: https://supabase.com/docs/guides/auth/server-side/nextjs
- Vercel 배포 문서: https://vercel.com/docs/deployments/overview
- OWASP 오픈 리다이렉트 방어: https://owasp.org/www-community/attacks/Unvalidated_Redirects_and_Forwards_Cheat_Sheet

---

## 문서 관리

이 문서는 사고·교훈이 발생할 때마다 업데이트합니다. 새로운 절대 규칙이나 함정을 발견하면 해당 섹션에 추가하십시오.

- **최종 업데이트**: 2026-06
- **프로젝트 운영자**: lasuteKong (동서물류)
