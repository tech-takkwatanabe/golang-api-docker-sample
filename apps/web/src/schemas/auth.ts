import { z } from 'zod';

export const nameSchema = z
  .string()
  .min(2, '名前を入力してください')
  .max(100, '100文字以内で入力してください');
export const emailSchema = z
  .string()
  .email('有効なメールアドレスを入力してください')
  .max(320, '入力文字数が多すぎます');
export const registPasswordSchema = z
  .string()
  .min(6, 'パスワードは6文字以上である必要があります')
  .max(200, '入力文字数が多すぎます');
export const loginPasswordSchema = z
  .string()
  .min(1, 'パスワードを入力してください')
  .max(200, '入力文字数が多すぎます');
