import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 注: 以下は、Orvalで生成されたAPI関数をインポートする例です
// Orvalを実行した後に適切にインポートしてください
// import { useLogin } from '../api/auth/auth';

const LoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();
	const { login } = useAuth();

	// Orvalで生成されたhooksを使用します
	// const { mutate: loginMutation, isLoading } = useLogin({
	//   onSuccess: (data) => {
	//     login(data.data.token);
	//     navigate('/dashboard');
	//   },
	//   onError: (error: any) => {
	//     setError(error.response?.data?.error || 'ログインに失敗しました');
	//   },
	// });

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!email || !password) {
			setError('すべてのフィールドを入力してください');
			return;
		}

		// ログインリクエストを送信
		// loginMutation({ email, password });

		// 注: Orvalを実行してAPIが生成されるまでは、以下のモックコードを使用できます
		try {
			console.log('Login attempt with:', { email, password });
			// モック用のトークン
			const mockToken = 'mock_jwt_token';
			login(mockToken);
			navigate('/dashboard');
		} catch (err) {
			setError('ログインに失敗しました');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
				<h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ログイン</h2>

				{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
							メールアドレス
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="your@email.com"
							required
						/>
					</div>

					<div className="mb-6">
						<label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
							パスワード
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="******"
							required
						/>
					</div>

					<div className="mb-6">
						<button
							type="submit"
							className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
							// disabled={isLoading}
						>
							{/* {isLoading ? 'ログイン中...' : 'ログイン'} */}
							ログイン
						</button>
					</div>

					<div className="text-center">
						<p>
							アカウントをお持ちでない方は{' '}
							<a href="/register" className="text-blue-500 hover:text-blue-600">
								登録する
							</a>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LoginPage;
