# apps/web: Oxlint+Biome 移行ワークフロー

本ドキュメントは、プロジェクトのリンター・フォーマッターを ESLint+Prettier から Oxlint+Biome へ移行した際の実績手順である。

## 1. パッケージの置換
ESLint/Prettier 関連を削除し、Oxlint/Biome をインストールする。
```bash
cd apps/web
pnpm remove eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-storybook eslint-plugin-unicorn prettier
pnpm add -D oxlint @biomejs/biome
```

## 2. 設定ファイルの作成・更新
- `biome.json` の作成（Prettier設定の移植）
- `.oxlintrc.json` の作成（ESLintルールの移植）
- `package.json` の scripts 更新 (`lint`, `fmt`)
- `tsconfig.json` のクリーンアップ（不要な設定ファイル参照の削除）
- `.vscode/settings.json` の更新（デフォルトフォーマッタを Biome に変更）
- `.vscode/extensions.json` の更新（推奨拡張機能を Biome/Oxc に変更）

## 3. 不要ファイルの削除
以下の設定ファイルを削除する。
- `eslint.config.mts`
- `tsconfig.eslint.json`
- `.prettierrc.json`
- `.prettierignore`

## 4. 一括フォーマットの実行
```bash
cd apps/web
pnpm fmt  # biome format --write ./src
```

## 5. Git Blame 設定（チーム共有）
リフォーマットによる blame のノイズを防ぐため、以下の設定を行う。
1. `.git-blame-ignore-revs` にリフォーマットコミットの SHA を追記する。
2. 各メンバーのローカルで以下のコマンドを実行する。
```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## 6. 検証
```bash
pnpm lint
pnpm test
pnpm build
```
Oxlint の `no-console` などで警告が出る場合は、`.oxlintrc.json` の `rules` で調整する。
