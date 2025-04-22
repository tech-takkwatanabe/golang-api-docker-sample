import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostRegister } from '../api/auth/auth';
import type { DtoErrorResponse } from '../api/models'; // Adjust the import path as needed

const RegisterPage = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const { mutate: registerMutation, isLoading } = usePostRegister();

	const handleSuccess = () => {
		navigate('/login', { state: { message: '登録が完了しました。ログインしてください。' } });
	};

	const handleError = (error: DtoErrorResponse) => {
		const errorMessage = (error as DtoErrorResponse)?.response?.data?.error || '登録に失敗しました';
		setError(errorMessage);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!name || !email || !password) {
			setError('すべてのフィールドを入力してください');
			return;
		}

		if (password.length < 6) {
			setError('パスワードは6文字以上である必要があります');
			return;
		}

		// 注: Orvalを実行してAPIが生成されるまでは、以下のモックコードを使用できます
		try {
			registerMutation(
				{ data: { name, email, password } },
				{
					onSuccess: handleSuccess,
					onError: handleError,
				}
			);
			// 登録リクエストを送信
			registerMutation({ data: { name, email, password } });
		} catch (err) {
			setError('登録に失敗しました');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
				<h2 className="text-2xl font-bold text-center text-gray-800 mb-6">アカウント登録</h2>

				{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
							名前
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="山田太郎"
							required
						/>
					</div>

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
							minLength={6}
						/>
					</div>

					<div className="mb-6">
						<button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading}>
							{isLoading ? '登録中...' : '登録する'}
							登録する
						</button>
					</div>

					<div className="text-center">
						<p>
							すでにアカウントをお持ちの方は{' '}
							<a href="/login" className="text-blue-500 hover:text-blue-600">
								ログイン
							</a>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RegisterPage;
