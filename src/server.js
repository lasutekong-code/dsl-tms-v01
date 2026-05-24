import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { URLSearchParams } from 'node:url';

const PORT = Number(process.env.PORT ?? 3000);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'development-session-secret';
const SESSION_COOKIE_NAME = 'admin_session';
const ONE_DAY_SECONDS = 60 * 60 * 24;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value) {
  return createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
}

function createSessionToken(username) {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      username,
      nonce: randomBytes(16).toString('base64url'),
    }),
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return parsed.role === 'admin' ? parsed : null;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf('=');
        if (separatorIndex === -1) {
          return [cookie, ''];
        }

        return [
          decodeURIComponent(cookie.slice(0, separatorIndex)),
          decodeURIComponent(cookie.slice(separatorIndex + 1)),
        ];
      }),
  );
}

function getAdminSession(request) {
  const cookies = parseCookies(request.headers.cookie);
  return verifySessionToken(cookies[SESSION_COOKIE_NAME]);
}

function getRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function sendHtml(response, statusCode, html, headers = {}) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    ...headers,
  });
  response.end(html);
}

function redirect(response, location, headers = {}) {
  response.writeHead(302, {
    Location: location,
    ...headers,
  });
  response.end();
}

function getSessionCookie(token) {
  return [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${ONE_DAY_SECONDS}`,
  ].join('; ');
}

function getExpiredSessionCookie() {
  return [
    `${SESSION_COOKIE_NAME}=`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0',
  ].join('; ');
}

function pageLayout(title, body) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} | DSL TMS</title>
    <style>
      body {
        align-items: center;
        background: #f5f7fb;
        color: #1f2937;
        display: flex;
        font-family: Arial, sans-serif;
        justify-content: center;
        margin: 0;
        min-height: 100vh;
      }

      main {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        max-width: 480px;
        padding: 32px;
        width: calc(100% - 48px);
      }

      h1 {
        margin: 0 0 16px;
      }

      label {
        display: block;
        font-weight: 700;
        margin-top: 16px;
      }

      input {
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        box-sizing: border-box;
        font: inherit;
        margin-top: 8px;
        padding: 12px;
        width: 100%;
      }

      button,
      a.button {
        background: #2563eb;
        border: 0;
        border-radius: 10px;
        color: #ffffff;
        cursor: pointer;
        display: inline-block;
        font: inherit;
        font-weight: 700;
        margin-top: 24px;
        padding: 12px 18px;
        text-decoration: none;
      }

      .error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 10px;
        color: #b91c1c;
        padding: 12px;
      }
    </style>
  </head>
  <body>
    <main>${body}</main>
  </body>
</html>`;
}

function loginPage(errorMessage = '') {
  const error = errorMessage
    ? `<p class="error" role="alert">${escapeHtml(errorMessage)}</p>`
    : '';

  return pageLayout(
    '관리자 로그인',
    `<h1>관리자 로그인</h1>
    ${error}
    <form method="post" action="/login">
      <label for="username">아이디</label>
      <input id="username" name="username" autocomplete="username" required>

      <label for="password">비밀번호</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>

      <button type="submit">로그인</button>
    </form>`,
  );
}

function dashboardPage(session) {
  return pageLayout(
    '대시보드',
    `<h1>대시보드</h1>
    <p>${escapeHtml(session.username)} 관리자님, 환영합니다.</p>
    <form method="post" action="/logout">
      <button type="submit">로그아웃</button>
    </form>`,
  );
}

export async function app(request, response) {
  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
  const session = getAdminSession(request);

  if (request.method === 'GET' && url.pathname === '/') {
    redirect(response, session ? '/dashboard' : '/login');
    return;
  }

  if (request.method === 'GET' && url.pathname === '/login') {
    if (session) {
      redirect(response, '/dashboard');
      return;
    }

    sendHtml(response, 200, loginPage());
    return;
  }

  if (request.method === 'POST' && url.pathname === '/login') {
    const form = new URLSearchParams(await getRequestBody(request));
    const username = form.get('username') ?? '';
    const password = form.get('password') ?? '';

    if (safeEqual(username, ADMIN_USERNAME) && safeEqual(password, ADMIN_PASSWORD)) {
      redirect(response, '/dashboard', {
        'Set-Cookie': getSessionCookie(createSessionToken(username)),
      });
      return;
    }

    sendHtml(response, 401, loginPage('아이디 또는 비밀번호가 올바르지 않습니다.'));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/dashboard') {
    if (!session) {
      redirect(response, '/login');
      return;
    }

    sendHtml(response, 200, dashboardPage(session));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/logout') {
    redirect(response, '/login', {
      'Set-Cookie': getExpiredSessionCookie(),
    });
    return;
  }

  sendHtml(response, 404, pageLayout('찾을 수 없음', '<h1>404</h1><p>요청한 페이지를 찾을 수 없습니다.</p>'));
}

if (process.env.NODE_ENV !== 'test') {
  createServer(app).listen(PORT, () => {
    console.log(`DSL TMS server is running at http://localhost:${PORT}`);
  });
}
