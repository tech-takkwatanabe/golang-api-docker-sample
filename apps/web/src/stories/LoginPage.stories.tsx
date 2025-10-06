import type { Meta, StoryObj } from '@storybook/react-webpack5';
// LoginPageは複雑な依存関係があるため、シンプルなモックコンポーネントを作成
const LoginPageMock = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ログイン</h2>
      <form>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">メールアドレス</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">パスワード</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            placeholder="******"
          />
        </div>
        <div className="mb-6">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
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

const meta = {
  title: 'Pages/LoginPage',
  component: LoginPageMock,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LoginPageMock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithErrorMessage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'ログインページのモック表示',
      },
    },
  },
};
