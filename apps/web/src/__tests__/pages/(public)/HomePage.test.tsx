import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/(public)/HomePage';

describe('HomePage', () => {
  test('renders HomePage component', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('認証アプリ')).toBeInTheDocument();
    expect(screen.getByText('ログイン')).toBeInTheDocument();
    expect(screen.getByText('登録')).toBeInTheDocument();
    expect(screen.getByText('Go + React 認証アプリケーション')).toBeInTheDocument();
    expect(screen.getByText('今すぐ始める')).toBeInTheDocument();
  });
});
