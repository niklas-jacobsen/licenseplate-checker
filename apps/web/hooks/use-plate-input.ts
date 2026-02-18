export function usePlateInput() {
  const formatLetters = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)
  }

  const formatNumbers = (value: string) => {
    let cleaned = value.replace(/[^0-9]/g, '')
    // No leading zeros
    if (cleaned.length > 0 && cleaned[0] === '0') {
      cleaned = cleaned.substring(1)
    }
    return cleaned.slice(0, 4)
  }

  return { formatLetters, formatNumbers }
}
