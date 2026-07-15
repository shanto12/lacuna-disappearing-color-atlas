import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://lacuna.test${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete LACUNA story", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(response.headers.get("content-security-policy") ?? "", /default-src 'self'/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");

  const html = await response.text();
  assert.match(html, /<title>LACUNA — An Atlas of Disappearing Color<\/title>/i);
  assert.match(html, /Some colors only exist/);
  assert.match(html, /The hesitation before blue/);
  assert.match(html, /At noon, the air edits every edge/);
  assert.match(html, /Rain gives color back its distance/);
  assert.match(html, /For eleven minutes/);
  assert.match(html, /Color does not disappear/);
  assert.match(html, /Skip to story/);
  assert.match(html, /Pause motion|Preparing motion/);
  assert.match(html, /role="status"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("ships production metadata and bespoke social imagery", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /property="og:title" content="LACUNA — Some colors only exist while they are leaving"/i);
  assert.match(html, /rel="canonical" href="https:\/\/lacuna-disappearing-color-atlas\.netlify\.app"/i);
  assert.match(html, /property="og:image" content="https:\/\/lacuna-disappearing-color-atlas\.netlify\.app\/og\.png"/i);
  assert.match(html, /name="twitter:card" content="summary_large_image"/i);
  await Promise.all([
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/favicon.ico", import.meta.url)),
    access(new URL("../public/favicon.svg", import.meta.url)),
  ]);
});

test("keeps the finished source accessible, bounded, and hardened", async () => {
  const [page, layout, css, packageJson, netlify, nextConfig, securityHeaders, worker] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../netlify.toml", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/security-headers.ts", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(`${page}${layout}${css}${packageJson}`, /_sites-preview|codex-preview|react-loading-skeleton|drizzle-orm/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /forced-colors:\s*active/);
  assert.match(page, /localStorage\.setItem\("lacuna-motion"/);
  assert.match(page, /window\.cancelAnimationFrame/);
  assert.match(page, /document\.addEventListener\("visibilitychange"/);
  assert.match(page, /<canvas/);
  assert.doesNotMatch(page, /<svg|dangerouslySetInnerHTML/);
  assert.match(netlify, /npm run build:netlify/);
  assert.match(nextConfig, /SECURITY_HEADERS/);
  assert.match(securityHeaders, /Content-Security-Policy/);
  assert.match(securityHeaders, /X-Content-Type-Options/);
  assert.match(worker, /headers\.set\(key, value\)/);
});
