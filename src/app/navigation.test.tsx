import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { SessionProvider } from './session';
import { routes } from './router';

// Proves the role-gated shell: the buyer sees buyer navigation and home, switching to farmer swaps
// both. This exercises the session context, the routes, and the role guards together. The same
// route table is mounted declaratively in a memory router so it runs without a browser history.
function MountedRoutes() {
  return useRoutes(routes);
}

function renderApp() {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={['/']}>
        <MountedRoutes />
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('role-gated shell', () => {
  beforeEach(() => {
    try {
      window.localStorage?.removeItem?.('fq.web.role');
    } catch {
      // Storage is best effort in the test environment.
    }
  });

  it('lands a buyer on the buyer home with buyer navigation', async () => {
    renderApp();
    expect(await screen.findByText('Buyer menu')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /Welcome to FarmersQuest/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse/i })).toBeInTheDocument();
  });

  it('switches to the farmer shell when the role changes', async () => {
    renderApp();
    await screen.findByRole('heading', { name: /Welcome to FarmersQuest/i });

    await userEvent.selectOptions(screen.getByRole('combobox'), 'farmer');

    expect(await screen.findByText('Farmer menu')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /Your farm on FarmersQuest/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Listings/i })).toBeInTheDocument();
  });
});
