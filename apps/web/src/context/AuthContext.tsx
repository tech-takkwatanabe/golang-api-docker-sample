import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type User = {
	id: number;
	name: string;
	email: string;
};

type AuthContextType = {
	user: User | null;
	token: string | null;
	login: (token: string) => void;
	logout: () => void;
	isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
	children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// トークンが保存されている場合、ユーザー情報を取得
		const loadUser = async () => {
			if (token) {
				try {
					// ここでは生成されたAPIをimportしてユーザー情報を取得します
					// 例: const { data } = await getCurrentUser();
					// setUser(data);
					// 注: この部分はOrvalでAPIが生成された後に実装してください
				} catch (error) {
					// console.error('ユーザー情報の取得に失敗しました', error);
					localStorage.removeItem('token');
					setToken(null);
				} finally {
					setIsLoading(false);
				}
			} else {
				setIsLoading(false);
			}
		};

		loadUser();
	}, [token]);

	const login = (newToken: string) => {
		localStorage.setItem('token', newToken);
		setToken(newToken);
	};

	const logout = () => {
		localStorage.removeItem('token');
		setToken(null);
		setUser(null);
	};

	const value = {
		user,
		token,
		login,
		logout,
		isLoading,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
