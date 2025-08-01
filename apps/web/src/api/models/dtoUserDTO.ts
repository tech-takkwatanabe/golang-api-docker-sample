/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * Go Auth API
 * Gin + JWT 認証API
 * OpenAPI spec version: 1.0
 */

export interface DtoUserDTO {
  /** @description 作成日時（RFC3339形式）
@example "2024-03-21T12:34:56.789Z" */
  created_at?: string;
  /** @description メールアドレス
@example "user@example.com" */
  email?: string;
  /** @description ユーザーID
@example 1 */
  id?: number;
  /** @description ユーザー名
@example "山田太郎" */
  name?: string;
  /** @description 更新日時（RFC3339形式）
@example "2024-03-21T12:34:56.789Z" */
  updated_at?: string;
  /** @description ユーザーUUID
@example "550e8400-e29b-41d4-a716-446655440000" */
  uuid?: string;
}
