import { test, expect, mock } from 'bun:test'
import { screen, render } from '@testing-library/react'

mock.module('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src: string
    alt: string
    width: number
    height: number
  }) => <img src={src} alt={alt} width={width} height={height} />,
}))

import SimpleNavBar from '@/components/nav-bar-simple'

test('renders simple nav bar component', () => {
  render(<SimpleNavBar />)
  const logo = screen.getByRole('img', { name: 'Licenseplate Checker' })
  expect(logo).toBeInTheDocument()
})
