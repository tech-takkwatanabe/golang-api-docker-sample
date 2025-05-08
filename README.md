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
- 認証成功後にAccessTokenとRefreshTokenを発行し、HttpOnlyのCookieで管理します
- RefreshTokenは`AWS DynamoDB`にも保存する構成になっています。RefreshTokenが有効な限り、AccessTokenの有効期限が切れても自動で再発行します。RefreshTokenの期限が切れた際には「もう一度ログインしてください」のアラートを表示します
- ログイン前にアクセスすると`/login`へリダイレクトされます
<hr>

### API Doc
![スクリーンショット 2025-05-08 18 56 36](https://github.com/user-attachments/assets/cc074392-e2f6-47af-a749-29e29f37c15b)
- バックエンドを立ち上げた状態で http://localhost:8080/swagger/index.html へアクセスしてください。
- APIに変更を加えた場合、`apps/api`にて`make swag`実行後、`apps/web`にて`pnpm orval`を実行してください。
<hr>

## プロジェクト構成

```
.
├── apps/
│   ├── api/          # Go言語で実装されたバックエンドAPI
│   │   ├── config/      # 定数
│   │   ├── controllers/  # APIコントローラー
│   │   ├── docs/        # APIドキュメント生成
│   │   ├── docker/      # Docker関連ファイル
│   │   ├── domain/      # ドメインモデル
│   │   ├── external/    # 外部接続
│   │   ├── infrastructure/  # インフラ層
│   │   ├── middlewares/ # ミドルウェア
│   │   ├── models/      # データモデル
│   │   ├── service/     # ビジネスロジック
│   │   ├── test/        # テストコード
│   │   ├── utils/       # ユーティリティ
│   │   ├── usecase/     # ユースケース
│   │   └── utils/      　# ユーティリティ
│   │
│   └── web/           # Reactで実装されたフロントエンド
│       ├── src/        # ソースコード
│       │   ├── api/    # APIクライアント生成
│       │   ├── atoms/  # jotaiのアトム
│       │   ├── hooks/  # カスタムフック
│       │   ├── pages/  # ページコンポーネント
│       │   ├── providers/ # プロバイダー
│       │   ├── schemas/   # Zodスキーマ
│       │   └── utils/     # ユーティリティ
│       ├── public/     # 静的ファイル
│       └── node_modules/ # 依存パッケージ
│
└── serverless/        # サーバーレス関連の設定ファイル
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

### RefreshToken用テーブル作成 (DynamoDB)

```bash
sam deploy --guided \
  --template-file serverless/refresh_token_dynamodb.yaml
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
- jotai
- craco
- TanStack Query
- ESLint（FlatConfig対応）
- Prettier

### PaaS
- AWS DynamoDB

## 開発ガイドライン

- Goで初めに参考にさせていただいた記事🙇 : https://qiita.com/fujifuji1414/items/b95d3f0d5f79d77360cb
- バックエンドAPIはクリーンアーキテクチャ的に構築
- `Swaggo`でAPI Docを生成し、それを元にフロントエンドで`Orval`でAPIクライアントを生成することで型を共有
- フロントエンドはあえて`Vite`ではなくあえて`CRA`で作成から構築（そのうちNextjsに変えたい）
- フロントエンドの雛形は`Claude`で、その後は`ChatGPT`と壁打ちしながら、が大枠です
- 大半はVSCodeで作業（`Github Copilot`あり）
- READMEは構築してから`Cursor`で全体を読み取って書いてもらったものを修正
- AIに課金はしていません
- 今後の課題 
  - テストコードの追加, DynamoDB Localを試してみる etc・・
