# axios → fetch 移行プラン

## 目的

`apps/web` の HTTP クライアントを `axios` から標準 `fetch` ベースに置き換え、axios 依存を完全に削除する。

- 対象パッケージ: `apps/web`
- 入口ファイル: `apps/web/src/api/mutator/custom-instance.ts`
- orval 生成コード (`apps/web/src/api/auth/auth.ts`) は **変更しない**（再生成も不要）方針で進める。
  - → `customInstance<T>(config, extraOptions)` の **シグネチャを維持**する。
  - orval が渡す `config` の形 (`{ url, method, headers, data, params, signal }` 等) を内部で fetch に翻訳する。

## 現状把握

### axios を参照しているファイル

| ファイル | 使い方 |
| --- | --- |
| `apps/web/src/api/mutator/custom-instance.ts` | `axios.create` / `axios.isAxiosError` / `AxiosRequestConfig` / refresh token キュー |
| `apps/web/src/hooks/useLogout.ts` | `axios.isAxiosError(error) && error.response?.status === 401` |
| `apps/web/src/pages/(public)/LoginPage.tsx` | `AxiosError<DtoErrorResponse>` 型で `response.data.error` を参照 |
| `apps/web/src/pages/(public)/RegisterPage.tsx` | 同上 |
| `apps/web/src/__tests__/hooks/useLogout.test.ts` | `vi.mock('axios', ...)` |
| `apps/web/package.json` | `devDependencies.axios` |

### `custom-instance.ts` に含まれる挙動（移行で壊してはいけないもの）

- `baseURL` と `withCredentials: true`（→ fetch では `credentials: 'include'`）
- orval が渡す `{ url, method, headers, data, params, signal }` を正しく組み立てる
  - `data` は JSON ボディに（既に `Content-Type: application/json` がヘッダで指定される）
  - `params` はクエリ文字列に
  - `signal` はそのまま `AbortSignal` として渡せる
- 成功時は `response.data` 相当（= パース済みボディ）を返す
- 401 かつ `_retry` 未設定 かつ パスが `/loggedin/refresh` `/loggedin/logout` `/login` 以外の場合:
  - `postLoggedinRefresh()` を呼び、
  - リフレッシュ中の後続リクエストは `pendingRequests` キューで待機、
  - 成功すれば元リクエストをリトライ、
  - 失敗すれば alert → logout → `/login` へ遷移。
- エラーは **axios 互換の形** で throw されている前提で、呼び出し側が `error.response?.status` / `error.response?.data?.error` を参照している。

## 方針

### 1. `HttpError` クラスを新設（axios 互換シェイプ）

既存の呼び出し側 (`LoginPage`, `RegisterPage`, `useLogout`) の変更を最小化するため、下記の形を保った独自エラーを投げる:

```ts
class HttpError<TData = unknown> extends Error {
  readonly name = 'HttpError';
  readonly status: number;
  readonly response: { status: number; data: TData };
  readonly config: RequestConfig;
  constructor(status: number, data: TData, config: RequestConfig) { ... }
}
```

加えて `isHttpError(e): e is HttpError` type guard を export。

→ 呼び出し側は `error as HttpError<DtoErrorResponse>` に型だけ差し替えれば `response.data.error` の参照箇所をそのまま残せる。

### 2. `custom-instance.ts` を fetch で書き直す

インターフェース（orval 互換）:

```ts
export type RequestConfig = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
  responseType?: 'json' | 'blob' | 'text';
};

export async function customInstance<T>(
  config: RequestConfig,
  extraOptions?: Partial<RequestConfig>,
): Promise<T>
```

内部処理:

1. `baseURL + url + (params → querystring)` で URL 構築（`URL` / `URLSearchParams` を利用）
2. `fetch` オプション組み立て
   - `method: (config.method ?? 'GET').toUpperCase()`
   - `credentials: 'include'`
   - `headers`: 呼び出し側指定 + `data` があり `Content-Type` 未指定なら `application/json` を付与
   - `body`: `data` が `FormData` / `Blob` / `string` なら素通し、それ以外は `JSON.stringify`
   - `signal`
3. レスポンス処理
   - `res.ok` なら `responseType` に応じて `.json() / .blob() / .text()`（デフォルト: Content-Type を見て JSON/空なら undefined）
   - `!res.ok` なら ボディを JSON として best-effort で読み、`HttpError(res.status, body, config)` を throw
4. 401 ハンドリング＆リトライ＆リフレッシュキューは現行ロジックをそのまま fetch 版に移植
   - `isHttpError(error) && error.status === 401 && !_retry && path not in [...]`
   - `_retry` フラグは `(config as CustomRequestConfig)._retry` で管理（従来通り）
5. ネットワークエラー（`fetch` が reject するケース）は `HttpError` ではない普通の `Error` としてそのまま伝搬。

### 3. 呼び出し側の更新（最小差分）

- **`useLogout.ts`**
  - `import axios from 'axios'` → `import { isHttpError } from '@/api/mutator/custom-instance'`
  - 判定を `isHttpError(error) && error.status === 401` に変更
- **`LoginPage.tsx` / `RegisterPage.tsx`**
  - `import type { AxiosError } from 'axios'` を削除
  - `import type { HttpError } from '@/api/mutator/custom-instance'` を追加
  - `error as AxiosError<DtoErrorResponse>` → `error as HttpError<DtoErrorResponse>`
  - `.response?.data?.error` の参照はそのまま動く（シェイプを保っているため）
- **`__tests__/hooks/useLogout.test.ts`**
  - `vi.mock('axios', ...)` を削除
  - `HttpError` を `@/api/mutator/custom-instance` から import
  - テスト中の `error` は `new HttpError(401, { error: 'unauthorized' }, { url: '/loggedin/logout' })` で生成

### 4. 依存削除

- `apps/web/package.json` の `devDependencies.axios` を削除
- `pnpm install` 実行で `pnpm-lock.yaml` 反映

### 5. 検証

1. 型チェック: `pnpm --filter web lint`（= `tsc --noEmit && eslint`）
2. 単体テスト: `pnpm --filter web test`
3. `grep -r "axios" apps/web/src` で残骸ゼロを確認
4. dev サーバ (`pnpm --filter web dev`) 起動 → ブラウザで以下を手動検証
   - ログイン成功
   - ログイン失敗（エラーメッセージが従来どおり日本語で表示される）
   - 登録成功／失敗
   - 認可必須 API 呼び出し時の 401 → 自動リフレッシュ → リトライ成功
   - リフレッシュ失敗時に alert → `/login` 遷移
   - ログアウト
5. ネットワークタブで `credentials: include` と `Content-Type` ヘッダが意図通りであることを確認

## 手順（実装順）

1. `custom-instance.ts` を fetch ベースで書き直す（`HttpError`, `isHttpError`, 401 リトライキュー）
2. `useLogout.ts` を `isHttpError` 判定に変更
3. `LoginPage.tsx`, `RegisterPage.tsx` の型のみ差し替え
4. `useLogout.test.ts` のモックとエラーシェイプを更新
5. `package.json` から axios を削除し `pnpm install`
6. 型チェック／テスト／手動検証（上記 5 項目）

## リスクと対策

| リスク | 対策 |
| --- | --- |
| orval 生成コードと互換が崩れる | `customInstance` の引数型を現行互換 (`{ url, method, headers, data, params, signal }`) で維持。`auth.ts` を読み、渡されるフィールドだけ確実に扱う（本リポジトリでは `url / method / headers / data / signal`） |
| 401 リフレッシュの競合 | 既存の `isRefreshing` + `pendingRequests` キュー構造を踏襲 |
| `DtoErrorResponse` 参照箇所が壊れる | `HttpError` を axios と同じ `error.response.data` 形にして互換維持 |
| fetch はネットワークエラー以外で throw しない | `!res.ok` の場合に自力で `HttpError` を throw し、axios と同じ挙動にそろえる |
| 空ボディ (`204 No Content` など) で `.json()` が失敗 | `Content-Length: 0` またはヘッダの `Content-Type` 不在時は `undefined` を返す |
| クッキーが送られない | `credentials: 'include'` をデフォルトで付与（現行の `withCredentials: true` と等価） |

## 変更対象まとめ

- 修正: `apps/web/src/api/mutator/custom-instance.ts`（全面書き換え）
- 修正: `apps/web/src/hooks/useLogout.ts`
- 修正: `apps/web/src/pages/(public)/LoginPage.tsx`
- 修正: `apps/web/src/pages/(public)/RegisterPage.tsx`
- 修正: `apps/web/src/__tests__/hooks/useLogout.test.ts`
- 修正: `apps/web/package.json` / `apps/web/pnpm-lock.yaml`
- 無変更: `apps/web/src/api/auth/auth.ts`（orval 自動生成。再生成も不要）
- 無変更: `apps/web/orval.config.ts`
