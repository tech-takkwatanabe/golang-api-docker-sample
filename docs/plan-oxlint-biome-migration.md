# apps/web: ESLint+Prettier → Oxlint+Biome 移行プラン

## 背景と目的
プロジェクトのリンター・フォーマッターを ESLint+Prettier から Oxlint+Biome へ移行する。
主な目的は、Rust ベースの高速なツールへの置き換えによる開発体験の向上と、依存パッケージの削減である。

## 概要

| カテゴリ | 移行前 | 移行後 |
|---------|-------|-------|
| リンター | ESLint v9 | **Oxlint** |
| フォーマッター | Prettier v3 | **Biome** |
| 依存関係 | 7 パッケージ | **2 パッケージ** |

## 移行の詳細

### 1. 依存パッケージの整理
以下の ESLint/Prettier 関連パッケージを削除し、高速な Rust 製ツールに置き換えた。

- **DELETED:** `eslint`, `@typescript-eslint/*`, `eslint-config-prettier`, `eslint-plugin-storybook`, `eslint-plugin-unicorn`, `prettier`
- **ADDED:** `oxlint`, `@biomejs/biome`

### 2. 設定の移植
#### Biome (Formatter)
Prettier の設定（`printWidth: 100`, `semi: true`, `singleQuote: true` 等）を `biome.json` に正確に移植した。

#### Oxlint (Linter)
ESLint で運用していたルールを `.oxlintrc.json` に反映。
- `no-var`: error
- `prefer-const`: off
- `no-console`: warn (error, warn を許可)
- `typescript/no-unused-vars`: warn

※ `eslint-plugin-storybook` 独自のルール（hierarchy-separator 等）は Oxlint 未対応のため削除した。

### 3. 一括フォーマットと Git Blame 保護
Biome によるプロジェクト全体の一括フォーマットを実施。
履歴のノイズを避けるため、`.git-blame-ignore-revs` を作成し、一括フォーマットのコミット SHA を登録した。

## 検証結果
- `pnpm lint`: ✅ 0 errors / 3 warnings (unicorn 関連の微細な指摘のみ)
- `pnpm test`: ✅ 38 tests all passed
- `pnpm build`: ✅ Success
