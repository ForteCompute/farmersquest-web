import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and a default type of button', () => {
    render(<Button>Browse the market</Button>);
    const button = screen.getByRole('button', { name: 'Browse the market' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('calls the click handler', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continue</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Disabled' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
