import localFont from 'next/font/local'

const euroPlate = localFont({
  src: '../public/fonts/EuroPlate-new.ttf',
})

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
  return (
    <div className="flex justify-center mb-6">
      <div className="relative w-72 md:w-80 md:h-20 bg-white border-2 border-black rounded-md flex items-center shadow-md overflow-hidden">
        {/* Blue EU stripe */}
        <div className="w-10 min-w-10 max-w-10 h-full bg-blue-600 flex flex-col items-center justify-center text-white text-xs font-bold">
          <div className="min-w-6 max-w-6 min-h-6 max-h-6 mt-1 mb-2 rounded-full bg-yellow-500 "></div>
          <div className="text-lg">D</div>
        </div>

        {/* Plate text */}
        <div
          className={`${euroPlate.className} flex flex-1 items-center justify-center`}
        >
          <div className="text-5xl uppercase">{city}</div>
          <div className="mx-2" />
          <div className="text-5xl uppercase">{letters}</div>
          <div className="mx-2" />
          <div className="text-5xl">{numbers}</div>
        </div>
      </div>
    </div>
  )
}
