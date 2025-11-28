import type { Meta, StoryObj } from '@storybook/react';
import Button from '../components/Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'ボタン',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'ボタン',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: '削除',
    variant: 'danger',
  },
};

export const Small: Story = {
  args: {
    children: '小さいボタン',
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    children: '中くらいのボタン',
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    children: '大きいボタン',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    children: '無効なボタン',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: '読み込み中',
    loading: true,
  },
};

export const AllVariants: Story = {
  args: {
    children: 'Default',
  },
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  args: {
    children: 'Default',
  },
  render: () => (
    <div className="flex gap-4 items-center flex-wrap">
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  ),
};
