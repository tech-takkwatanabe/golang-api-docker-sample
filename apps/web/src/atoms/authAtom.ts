import { atom } from 'jotai';
import { DtoUserDTOResponse } from '@/api/models';

// 認証済みユーザー情報
export const userAtom = atom<DtoUserDTOResponse | null>(null);

// ロード中かどうか
export const isLoadingAtom = atom(true);

// 認証されているか
export const isAuthenticatedAtom = atom((get) => !!get(userAtom));
