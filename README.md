# golang-api-docker-sample

このプロジェクトは、Go言語で実装されたバックエンドAPIとReactで実装されたフロントエンドWebアプリケーションで構成されるサンプルアプリケーションです。

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

## 開発環境のセットアップ

### バックエンドAPI (Go)

```bash
cd apps/api

# 依存関係のインストールと環境構築
make init
```

### フロントエンドWebアプリケーション (React)

```bash
cd apps/web

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
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
- Docker Compose


### フロントエンド
- React
- TypeScript
- Tailwind CSS
- pnpm
- Orval (APIクライアント生成)

## 開発ガイドライン

- バックエンドAPIはクリーンアーキテクチャを採用
- フロントエンドはコンポーネントベースの設計
- コードフォーマットはPrettierを使用
- リンターはESLintを使用

## テスト

### バックエンド
```bash
cd apps/api
make test
```

### フロントエンド
```bash
cd apps/web
pnpm test
```