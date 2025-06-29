import { render, screen } from '@testing-library/react';
import NotFoundPage from '@/pages/(public)/NotFoundPage';

describe('NotFoundPage', () => {
  test('renders NotFoundPage component', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('ページが見つかりませんでした。')).toBeInTheDocument();
  });
});
