# axios → fetch 移行ワークフロー

`apps/web` の HTTP クライアントを axios から標準 fetch に置き換えた際の実作業ログ。プラン本体は [`plan-remove-axios.md`](./plan-remove-axios.md) を参照。

## 1. 事前調査

### 1-1. 使用箇所の洗い出し

```bash
grep -rn "axios" apps/web/src
```

結果（6 ファイル + `package.json`）:

| ファイル | 依存内容 |
| --- | --- |
| `apps/web/src/api/mutator/custom-instance.ts` | 本体（`axios.create` / 401 リフレッシュ / `isAxiosError`） |
| `apps/web/src/hooks/useLogout.ts` | `axios.isAxiosError` |
| `apps/web/src/pages/(public)/LoginPage.tsx` | `AxiosError<DtoErrorResponse>` 型で `response.data.error` 参照 |
| `apps/web/src/pages/(public)/RegisterPage.tsx` | 同上 |
| `apps/web/src/__tests__/hooks/useLogout.test.ts` | `vi.mock('axios', ...)` |
| `apps/web/src/__mocks__/axios.ts` | vitest 用の axios モック |
| `apps/web/package.json` | `devDependencies.axios` |

### 1-2. 関連ファイル確認

- `apps/web/orval.config.ts` → `client: 'react-query'` + `override.mutator` で custom-instance を指定しているので、mutator のシグネチャを維持できれば生成コード (`apps/web/src/api/auth/auth.ts`) は**無変更で良い**。
- 生成コードが `customInstance({ url, method, headers, data, signal }, options)` の形で呼んでいることを確認。

## 2. 設計判断

1. **orval 生成コード (`apps/web/src/api/auth/auth.ts`) は触らない**。`customInstance<T>(config, extraOptions)` のシグネチャを維持する。
2. 呼び出し側 (`LoginPage` / `RegisterPage` / `useLogout`) の変更を最小化するため、axios エラー互換の **`HttpError` クラス**を mutator から export する。
    - `error.response.{status, data}` の形を保つ → Page 側は型名の差し替えだけで済む。
    - `isHttpError(e)` 型ガードを export → `useLogout` の 401 判定に使う。
3. 401 リトライキュー (`isRefreshing` + `pendingRequests`) は現行挙動をそのまま移植。

## 3. 実装手順（実行順）

### 3-1. `custom-instance.ts` を fetch ベースで書き直し

- `HttpError` クラスと `isHttpError` 型ガード
- `buildUrl` / `buildBody` / `parseResponse` / `parseErrorBody` の各ヘルパ
- `doFetch` → 共通実行部（`credentials: 'include'` 固定、`!res.ok` 時に `HttpError` を throw）
- `customInstance` → 401 リトライ + リフレッシュキュー（既存ロジック踏襲）

### 3-2. `useLogout.ts`

```diff
- import axios from 'axios';
+ import { isHttpError } from '@/api/mutator/custom-instance';
...
- if (axios.isAxiosError(error) && error.response?.status === 401) {
+ if (isHttpError(error) && error.status === 401) {
```

### 3-3. `LoginPage.tsx` / `RegisterPage.tsx`

```diff
- import type { AxiosError } from 'axios';
+ import type { HttpError } from '@/api/mutator/custom-instance';
...
- const axiosError = error as AxiosError<DtoErrorResponse>;
- const errorCode = axiosError.response?.data?.error ?? 'unknown error';
+ const httpError = error as HttpError<DtoErrorResponse>;
+ const errorCode = httpError.response?.data?.error ?? 'unknown error';
```

`error.response.{status,data}` のシェイプを保っているので、参照ロジックは変更不要。

### 3-4. `useLogout.test.ts`

- `vi.mock('axios', ...)` を削除
- `import { HttpError } from '@/api/mutator/custom-instance'` を追加
- `isAxiosError: true` を持つ偽オブジェクトを `new HttpError(401, { error: 'unauthorized' }, { url: '/loggedin/logout' })` に置換

### 3-5. 不要ファイル削除

```bash
rm apps/web/src/__mocks__/axios.ts
rmdir apps/web/src/__mocks__
```

### 3-6. 依存削除

`apps/web/package.json` から `"axios": "^1.13.5"` を削除してから:

```bash
cd apps/web
pnpm install
```

→ lockfile から axios と関連サブ依存が除外される。

## 4. 検証

```bash
cd apps/web

# 型チェック + eslint
pnpm lint

# 単体テスト
pnpm test

# ソースに残存する axios 参照がないか
grep -rn "axios" src
```

### 4-1. 手動検証（dev サーバ + ブラウザ）

```bash
pnpm dev
```

- ユーザー登録 → 200 OK
- ログイン成功 / 失敗（日本語エラー文言が出る）
- 認可必須 API の 401 → 自動リフレッシュ → リトライ成功
- ログアウト
- DevTools Network で `Content-Type: application/json` と `credentials: include`（Cookie 送信）を確認

## 5. 踏んだ落とし穴と対処

### 5-1. `new URL(path, base)` で `/api` が落ちる

**症状:** `POST http://localhost:8080/register` で 404（期待: `/api/register`）。

**原因:** `new URL('/register', 'http://localhost:8080/api/')` は第 1 引数の先頭 `/` を絶対パス扱いするため、base の pathname (`/api`) を捨てる。axios の `baseURL` は単純な文字列連結なので挙動が異なる。

**対処:** `buildUrl` を文字列連結ベースに変更。

```ts
const base = (config.baseURL ?? API_URL).replace(/\/+$/, '');
const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
const url = new URL(base + path);
```

### 5-2. Vite の dev サーバが mutator の変更を拾わないことがある

`custom-instance.ts` はアプリ起動時に一度だけ評価されるモジュールで、HMR では差し替わらないケースがある。挙動が変わらない場合は dev サーバを再起動する。

```bash
rm -rf node_modules/.vite
pnpm dev
```

### 5-3. `ERR_EMPTY_RESPONSE`

**症状:** URL は正しいのに `net::ERR_EMPTY_RESPONSE`。curl でも `Empty reply from server`。

**原因:** Go API コンテナが DB 接続失敗で起動直後にクラッシュし、Docker 側が TCP は受理するが中の Gin は死亡 → 即切断。

**確認コマンド:**

```bash
docker logs golang-api-docker-sample-go-1 --tail 30
# → "Failed to connect to database: ... Process Exit with Code: 1"
```

**対処:** MySQL コンテナが先に起動完了しているのを確認してから、Go コンテナだけ再起動。

```bash
docker restart golang-api-docker-sample-go-1
```

起動ログに `Database connection established` と `Listening and serving HTTP on :8080` が出れば OK。

## 6. 最終結果

- `apps/web/src` 配下から axios 参照ゼロ
- 自動テスト: 38/38 pass / lint pass
- 手動テスト: 登録・ログイン・ログアウト・401 リフレッシュ全て成功
- `pnpm-lock.yaml` 上に残る `@orval/axios` は orval 内部パッケージでランタイム未使用（`client: 'react-query'` + custom mutator を使っているため）

## 7. 変更ファイル一覧

- 全面書き換え: `apps/web/src/api/mutator/custom-instance.ts`
- 型/判定差し替え: `apps/web/src/hooks/useLogout.ts`, `apps/web/src/pages/(public)/LoginPage.tsx`, `apps/web/src/pages/(public)/RegisterPage.tsx`
- テスト更新: `apps/web/src/__tests__/hooks/useLogout.test.ts`
- 削除: `apps/web/src/__mocks__/axios.ts`（+ 空になった `__mocks__` ディレクトリ）
- 依存削除: `apps/web/package.json`, `apps/web/pnpm-lock.yaml`
- 無変更: `apps/web/src/api/auth/auth.ts`（orval 自動生成）, `apps/web/orval.config.ts`
