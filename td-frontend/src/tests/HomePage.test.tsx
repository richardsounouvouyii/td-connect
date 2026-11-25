import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from '@/features/dashboards/public/HomePage'

describe('HomePage', () => {
  it('affiche la marque et l’appel à la connexion', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /les travaux dirigés, clairement organisés/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /se connecter/i }).length,
    ).toBeGreaterThan(0)
  })
})
