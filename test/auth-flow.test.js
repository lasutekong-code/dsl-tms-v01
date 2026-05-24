import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

process.env.NODE_ENV = 'test';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'secret-password';
process.env.SESSION_SECRET = 'test-session-secret';

const { app } = await import('../src/server.js');

describe('admin authentication flow', () => {
  let server;
  let baseUrl;

  before(async () => {
    server = createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));

    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('redirects unauthenticated users from /dashboard to /login', async () => {
    const response = await fetch(`${baseUrl}/dashboard`, {
      redirect: 'manual',
    });

    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), '/login');
  });

  it('allows an admin to login, access /dashboard, and logout', async () => {
    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      body: new URLSearchParams({
        username: 'admin',
        password: 'secret-password',
      }),
      redirect: 'manual',
    });

    assert.equal(loginResponse.status, 302);
    assert.equal(loginResponse.headers.get('location'), '/dashboard');

    const sessionCookie = loginResponse.headers.get('set-cookie')?.split(';')[0];
    assert.match(sessionCookie ?? '', /^admin_session=/);

    const dashboardResponse = await fetch(`${baseUrl}/dashboard`, {
      headers: {
        Cookie: sessionCookie,
      },
    });
    const dashboardHtml = await dashboardResponse.text();

    assert.equal(dashboardResponse.status, 200);
    assert.match(dashboardHtml, /대시보드/);
    assert.match(dashboardHtml, /로그아웃/);

    const logoutResponse = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: {
        Cookie: sessionCookie,
      },
      redirect: 'manual',
    });

    assert.equal(logoutResponse.status, 302);
    assert.equal(logoutResponse.headers.get('location'), '/login');
    assert.match(logoutResponse.headers.get('set-cookie') ?? '', /Max-Age=0/);
  });

  it('rejects invalid admin credentials', async () => {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      body: new URLSearchParams({
        username: 'admin',
        password: 'wrong-password',
      }),
      redirect: 'manual',
    });
    const html = await response.text();

    assert.equal(response.status, 401);
    assert.match(html, /올바르지 않습니다/);
    assert.equal(response.headers.get('set-cookie'), null);
  });
});
