# dsl-tms-v01

DSL TMS v01 관리자 인증 예제입니다.

## 실행

```bash
npm start
```

기본 접속 주소는 `http://localhost:3000`입니다.

## 관리자 로그인

개발 기본 계정:

- 아이디: `admin`
- 비밀번호: `admin123`

운영 또는 배포 환경에서는 아래 환경 변수로 값을 지정하세요.

```bash
ADMIN_USERNAME=admin \
ADMIN_PASSWORD=your-password \
SESSION_SECRET=your-session-secret \
npm start
```

## 인증 흐름

- 로그인하지 않은 사용자가 `/dashboard`에 접근하면 `/login`으로 이동합니다.
- 관리자는 `/login`에서 로그인 후 `/dashboard`에 접근할 수 있습니다.
- `/dashboard`에서 로그아웃하면 세션 쿠키가 삭제되고 `/login`으로 이동합니다.

## 테스트

```bash
npm test
```
