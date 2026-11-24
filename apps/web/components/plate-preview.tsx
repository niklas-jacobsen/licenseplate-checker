import { euroPlate } from '@/lib/plate-font'
import { cn } from '@/lib/utils'

interface LicensePlatePreviewProps {
  city: string
  letters: string
  numbers: string
  /** a smaller plate for narrow columns */
  compact?: boolean
}

export default function LicensePlatePreview({
  city,
  letters,
  numbers,
  compact = false,
}: LicensePlatePreviewProps) {
  const text = compact ? 'text-[44px]' : 'text-5xl'

  return (
    <div className={cn('flex justify-center', compact ? 'mb-4' : 'mb-6')}>
      <div
        className={cn(
          'relative bg-white border-2 border-black rounded-md flex items-center shadow-md overflow-hidden',
          compact ? 'h-[72px] w-72' : 'w-72 md:w-80 md:h-20'
        )}
      >
        {/* Blue EU stripe */}
        <div className="w-10 min-w-10 max-w-10 h-full bg-blue-600 flex flex-col items-center justify-center text-white text-xs font-bold">
          <div className="min-w-6 max-w-6 min-h-6 max-h-6 mt-1 mb-2 rounded-full bg-yellow-500 "></div>
          <div className="text-lg">D</div>
        </div>

        {/* Plate text */}
        <div
          className={`${euroPlate.className} flex flex-1 items-center justify-center`}
        >
          <div className={cn(text, 'uppercase')}>{city}</div>
          <div className="mx-2" />
          <div className={cn(text, 'uppercase')}>{letters}</div>
          <div className="mx-2" />
          <div className={text}>{numbers}</div>
        </div>
      </div>
    </div>
  )
}
