import { test, expect } from 'bun:test'
import { screen, render } from '@testing-library/react'
import SimpleNavBar from 'apps/web/components/nav-bar-simple'

test('renders simple nav bar component', () => {
  render(<SimpleNavBar />)
  const heading = screen.getByText('Licenseplate Checker')
  expect(heading).toBeInTheDocument()
})
