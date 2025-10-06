import React from 'react';

export type ButtonProps = {
  /**
   * ボタンのテキスト
   */
  children: React.ReactNode;
  /**
   * ボタンのスタイル
   */
  variant?: 'primary' | 'secondary' | 'danger';
  /**
   * ボタンのサイズ
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * 無効状態
   */
  disabled?: boolean;
  /**
   * ローディング状態
   */
  loading?: boolean;
  /**
   * クリックイベント
   */
  onClick?: () => void;
  /**
   * ボタンのタイプ
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * 追加のCSSクラス
   */
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseClasses = 'font-medium rounded-md focus:outline-hidden focus:ring-2 transition-colors';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const loadingClasses = 'opacity-75 cursor-wait';

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled && disabledClasses,
    loading && loadingClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={buttonClasses} disabled={disabled || loading} onClick={onClick}>
      {loading ? (
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
