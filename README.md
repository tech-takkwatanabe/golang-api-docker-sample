# golang-api-docker-sample

このプロジェクトは、Go言語で実装されたバックエンドAPIと、Reactで実装されたフロントエンドWebアプリケーションで構成されるサンプルアプリケーションです。

## インターフェース

### ホーム画面
![interface_1](https://github.com/user-attachments/assets/d44d25b5-fcc7-4a83-a40f-29dc2d975f9f)
- 見た目の設定はClaudeに作成してもらったものから触っていません
<hr>

### アカウント登録
![interface_2](https://github.com/user-attachments/assets/182a3f87-c128-4112-b5f6-3c5f88b461cd)
- Zodでバリデーションを設定しています
- メールアドレスが登録済みのものだとエラーになります
- ログイン後にアクセスすると`/dashboard`へリダイレクトされます
<hr>

### ログイン画面
![interface_3](https://github.com/user-attachments/assets/9c9c77a7-b149-4d38-8a89-592f49b739b3)
- Zodでバリデーションを設定しています
- ログイン後にアクセスすると`/dashboard`へリダイレクトされます
<hr>

### ダッシュボード
![interface_4](https://github.com/user-attachments/assets/4842c773-73db-4f0c-8e06-cd1d3acb3320)
- 認証中のユーザー情報を表示します
- 認証状態はHttpOnlyのCookieで管理しています
- ログイン前にアクセスすると`/login`へリダイレクトされます

## プロジェクト構成

```
.
├── apps/
│   ├── api/          # Go言語で実装されたバックエンドAPI
│   │   ├── controllers/  # APIコントローラー
│   │   ├── domain/      # ドメインモデル
│   │   ├── middlewares/ # ミドルウェア
│   │   ├── models/      # データモデル
│   │   ├── service/     # ビジネスロジック
│   │   ├── usecase/     # ユースケース
│   │   ├── utils/       # ユーティリティ
│   │   ├── docs/        # APIドキュメント
│   │   ├── test/        # テストコード
│   │   └── docker/      # Docker関連ファイル
│   │
│   └── web/           # Reactで実装されたフロントエンド
│       ├── src/        # ソースコード
│       ├── public/     # 静的ファイル
│       └── node_modules/ # 依存パッケージ
│
└── serverless/        # サーバーレス関連の設定ファイル（追加予定）
```

## Getting Started

### バックエンドAPI (Go)

```bash
cd apps/api
cp .env.example .env
make init
```

### フロントエンドWebアプリケーション (React)

```bash
cd apps/web
cp .env.example .env.local
pnpm install
pnpm dev
```

## 技術スタック

### バックエンド
- Golang
- Gin
- GORM
- Air (ホットリロード)
- Swaggo (API Doc生成)
- Docker
- MySQL


### フロントエンド
- React
- TypeScript
- Tailwind CSS
- pnpm
- Orval (APIクライアント生成)
- React Hook Form
- Zod
- craco
- ESLint（FlatConfig対応）
- Prettier

## 開発ガイドライン

- Goで初めに参考にさせていただいた記事🙇 : https://qiita.com/fujifuji1414/items/b95d3f0d5f79d77360cb
- バックエンドAPIはクリーンアーキテクチャ的に構築
- フロントエンドはあえて`Vite`ではなくあえて`CRA`で作成から構築（そのうちNextjsに変えたい）
- フロントエンドの雛形は`Claude`で、その後は`ChatGPT`と壁打ちしながら、が大枠です
- 大半はVSCodeで作業（`Github Copilot`あり）
- READMEは構築してから`Cursor`で全体を読み取って書いてもらったものを修正
- AIに課金はしていません
- ServerlessでRefreshTokenを`DynamoDB`に保存するような構成にしていく予定
- 今後の課題 
  - テストコードの追加 etc・・