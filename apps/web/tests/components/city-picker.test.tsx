import { describe, expect, it, mock } from 'bun:test'
import { render, screen, fireEvent } from '@testing-library/react'

mock.module('../../services/city.service', () => ({
  cityService: { getCities: mock() },
}))

import CityPicker from '@/components/city-picker'
import type { City } from '../../services/city.service'

const CITIES: City[] = [
  { id: 'K', name: 'Köln', allowedDomains: ['koeln.de'] },
  { id: 'MS', name: 'Münster', allowedDomains: ['stadt-muenster.de'] },
  { id: 'B', name: 'Berlin', allowedDomains: ['berlin.de'] },
]

describe('CityPicker', () => {
  it('shows "Select a city" when no value is selected', () => {
    render(
      <CityPicker value="" onChange={mock()} cities={CITIES} />
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Select a city')
  })

  it('shows selected city name and id when value matches', () => {
    render(
      <CityPicker value="MS" onChange={mock()} cities={CITIES} />
    )
    const button = screen.getByRole('combobox')
    expect(button).toHaveTextContent('Münster')
    expect(button).toHaveTextContent('(MS)')
  })

  it('filters out cities without allowedDomains', () => {
    const citiesWithEmpty: City[] = [
      ...CITIES,
      { id: 'X', name: 'NoDomainsCity', allowedDomains: [] },
    ]
    render(
      <CityPicker value="" onChange={mock()} cities={citiesWithEmpty} />
    )

    fireEvent.click(screen.getByRole('combobox'))

    expect(screen.queryByText('NoDomainsCity')).not.toBeInTheDocument()
    expect(screen.getByText('Köln')).toBeInTheDocument()
  })

  it('sorts cities alphabetically by name', () => {
    render(
      <CityPicker value="" onChange={mock()} cities={CITIES} />
    )

    fireEvent.click(screen.getByRole('combobox'))

    const items = screen.getAllByRole('option')
    const names = items.map((el) => el.textContent?.replace(/[A-Z]{1,3}$/, '').trim())
    expect(names).toEqual(['Berlin', 'Köln', 'Münster'])
  })

  it('opens dropdown on click and closes on second click', () => {
    render(
      <CityPicker value="" onChange={mock()} cities={CITIES} />
    )

    const button = screen.getByRole('combobox')
    expect(screen.queryByPlaceholderText('Search by name or code...')).not.toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByPlaceholderText('Search by name or code...')).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.queryByPlaceholderText('Search by name or code...')).not.toBeInTheDocument()
  })

  it('calls onChange when a city is selected', () => {
    const handleChange = mock()
    render(
      <CityPicker value="" onChange={handleChange} cities={CITIES} />
    )

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Köln'))

    expect(handleChange).toHaveBeenCalledWith('K')
  })

  it('closes dropdown after selecting a city', () => {
    render(
      <CityPicker value="" onChange={mock()} cities={CITIES} />
    )

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Berlin'))

    expect(screen.queryByPlaceholderText('Search by name or code...')).not.toBeInTheDocument()
  })

  it('adds border-red-500 class when error prop is true', () => {
    render(
      <CityPicker value="" onChange={mock()} cities={CITIES} error />
    )
    expect(screen.getByRole('combobox').className).toContain('border-red-500')
  })

  it('disables button when disabled prop is true', () => {
    render(
      <CityPicker value="" onChange={mock()} cities={CITIES} disabled />
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})
