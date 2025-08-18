import { z } from 'zod';

export const nameSchema = z
  .string()
  .min(2, { message: '名前を入力してください' })
  .max(100, { message: '100文字以内で入力してください' });
export const emailSchema = z
  .string()
  .email({ message: '有効なメールアドレスを入力してください' })
  .max(320, { message: '入力文字数が多すぎます' });
export const registPasswordSchema = z
  .string()
  .min(6, { message: 'パスワードは6文字以上である必要があります' })
  .max(200, { message: '入力文字数が多すぎます' });
export const loginPasswordSchema = z
  .string()
  .min(1, { message: 'パスワードを入力してください' })
  .max(200, { message: '入力文字数が多すぎます' });
