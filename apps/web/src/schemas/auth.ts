import { z } from 'zod';

export const nameSchema = z.string().min(2, '名前を入力してください');
export const emailSchema = z.string().email('有効なメールアドレスを入力してください');
export const registPasswordSchema = z.string().min(6, 'パスワードは6文字以上である必要があります');
export const loginPasswordSchema = z.string().min(1, 'パスワードを入力してください');
