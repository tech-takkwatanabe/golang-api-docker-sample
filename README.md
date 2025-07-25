# golang-api-docker-sample

このプロジェクトは、Go言語で実装されたバックエンドAPIと、Reactで実装されたフロントエンドWebアプリケーションで構成されるサンプルアプリケーションです。

## インターフェース

### ホーム画面
![interface_1](https://github.com/user-attachments/assets/d44d25b5-fcc7-4a83-a40f-29dc2d975f9f)
- 見た目の設定はClaudeに作成してもらったものから触っていません
***

### アカウント登録
![interface_2](https://github.com/user-attachments/assets/182a3f87-c128-4112-b5f6-3c5f88b461cd)
- Zodでバリデーションを設定しています
- メールアドレスが登録済みのものだとエラーになります
- ログイン後にアクセスすると`/dashboard`へリダイレクトされます
***

### ログイン画面
![interface_3](https://github.com/user-attachments/assets/9c9c77a7-b149-4d38-8a89-592f49b739b3)
- Zodでバリデーションを設定しています
- ログイン後にアクセスすると`/dashboard`へリダイレクトされます
***

### ダッシュボード
![interface_4](https://github.com/user-attachments/assets/4842c773-73db-4f0c-8e06-cd1d3acb3320)
- 認証中のユーザー情報を表示します
- 認証成功後にAccessTokenとRefreshTokenを発行し、HttpOnlyのCookieで管理します
- RefreshTokenは`AWS DynamoDB`にも保存する構成になっています。RefreshTokenが有効な限り、AccessTokenの有効期限が切れても自動で再発行します。RefreshTokenの期限が切れた際には「もう一度ログインしてください」のアラートを表示します
- ログイン前にアクセスすると`/login`へリダイレクトされます
***

### API Doc
![スクリーンショット 2025-05-08 18 58 46](https://github.com/user-attachments/assets/222783cc-a5ec-4d77-ac78-17fecbd5a7b1)
- バックエンドを立ち上げた状態で http://localhost:8080/swagger/index.html へアクセスしてください。
- APIに変更を加えた場合、`apps/api`にて`make swag`実行後、`apps/web`にて`pnpm ovl`を実行してください。
***

### DynamoDBに保存されるRefreshToken
![スクリーンショット 2025-05-08 22 34 35](https://github.com/user-attachments/assets/9b95060e-7cb8-429f-a3e1-7b07955a5be3)
- ~~`refresh_token_id` = `user.uuid`にしているので、同じユーザーでログインし直すと上書きされます。~~ → マルチデバイスへのログイン等を考慮し、 `refresh_token_id` = `jti`に変更。ローテーション実装。
- `expire_at`をTTLに指定していることで、自動的にレコードが消えます（DynamoDBの仕様で、期限後すぐには消滅するわけではない）。
***

## プロジェクト構成

```
.
├── apps/
│   ├── api/          # Go言語で実装されたバックエンドAPI
│   │   ├── config/      # 定数
│   │   ├── controllers/  # APIコントローラー
│   │   ├── docs/        # 生成されたAPIドキュメント
│   │   ├── docker/      # Docker関連ファイル
│   │   ├── domain/      # ドメインモデル
│   │   ├── external/    # 外部接続
│   │   ├── infrastructure/  # インフラ層
│   │   ├── middlewares/ # ミドルウェア
│   │   ├── models/      # データモデル
│   │   ├── service/     # ビジネスロジック
│   │   ├── test/        # テストコード
│   │   ├── usecase/     # ユースケース
│   │   └── utils/      　# ユーティリティ
│   │
│   └── web/           # Reactで実装されたフロントエンド
       ├── .storybook/ # Storybook設定ファイル
       ├── src/        # ソースコード
       │   ├── __tests__/ # テストファイル
       │   ├── api/    # 生成されたAPIクライアント
       │   ├── atoms/  # jotaiのアトム
       │   ├── components/ # 再利用可能コンポーネント
       │   ├── hooks/  # カスタムフック
       │   ├── pages/  # ページコンポーネント
       │   ├── providers/ # プロバイダー
       │   ├── schemas/   # Zodスキーマ
       │   ├── stories/   # Storybookストーリー
       │   └── utils/     # ユーティリティ
       ├── public/     # 静的ファイル
       ├── storybook-static/ # Storybookビルド出力
       └── node_modules/ # 依存パッケージ
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
- TanStack Query
- ESLint（FlatConfig対応）
- Prettier

### PaaS
- AWS DynamoDB

## 開発ガイドライン

- Goで初めに参考にさせていただいた記事🙇 : https://qiita.com/fujifuji1414/items/b95d3f0d5f79d77360cb
- バックエンドAPIはクリーンアーキテクチャ的に構築
- `Swaggo`でAPI Docを生成し、それを元にフロントエンドで`Orval`でAPIクライアントを生成することで型を共有
- フロントエンドは`Vite`ではなく、`CRA`で構築
- フロントエンドの雛形は`Claude`に作ってもらい、その後は`ChatGPT`と壁打ちしながら実装
- 大半はVSCodeで作業（`Github Copilot`あり）
- READMEは構築してから`Cursor`で全体を読み取って書いてもらったものを修正
- AIに課金はしていません
- 今後の課題 
  - テストコードの追加, DynamoDB Localを試してみる etc・・
