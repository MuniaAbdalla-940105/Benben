import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MoneySummary, Tabs, formatRemaining } from '@benben/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

describe('ui kit', () => {
  it('formats remaining time', () => {
    expect(formatRemaining(65_000)).toBe('01:05');
    expect(formatRemaining(3_725_000)).toBe('1:02:05');
    expect(formatRemaining(-5)).toBe('00:00');
  });

  it('shows piasters as EGP in the chosen language', () => {
    render(<MoneySummary locale="en" lines={[{ label: 'Deposit', piasters: 500000 }]} />);
    expect(screen.getByText('5,000 EGP')).toBeTruthy();
  });

  it('changes tab on click', () => {
    const onChange = vi.fn();
    render(<Tabs label="t" value="a" onChange={onChange} items={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]} />);
    fireEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
