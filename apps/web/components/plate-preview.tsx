interface LicensePlatePreviewProps {
  city: string
  letters: string
  numbers: string
}

export default function LicensePlatePreview({
  city,
  letters,
  numbers,
}: LicensePlatePreviewProps) {
  return <div>{city + letters + numbers}</div>
}
