import {
  Check,
  FlagTriangleRight,
  GitBranch,
  Globe,
  Keyboard,
  type LucideIcon,
  MousePointerClick,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './workflow-animation.module.css'

// One step of the run loop, see workflow-animation.module.css (r0–r5 / d0–d5).
type Step = 0 | 1 | 2 | 3 | 4 | 5
type Side = 'top' | 'right' | 'bottom' | 'left'

const runningClass = [styles.r0, styles.r1, styles.r2, styles.r3, styles.r4, styles.r5]
const doneClass = [styles.d0, styles.d1, styles.d2, styles.d3, styles.d4, styles.d5]

const NODE_WIDTH = 180

// Targets are emerald, sources blue, as in the builder's BaseHandle.
const handleClass: Record<Side, string> = {
  top: '-top-[6px] left-1/2 -ml-[5.5px] bg-emerald-100 border-emerald-400',
  left: '-left-[6px] top-1/2 -mt-[5.5px] bg-emerald-100 border-emerald-400',
  bottom: '-bottom-[6px] left-1/2 -ml-[5.5px] bg-blue-100 border-blue-400',
  right: '-right-[6px] top-1/2 -mt-[5.5px] bg-blue-100 border-blue-400',
}

function FlowNode({
  x,
  y,
  icon: Icon,
  label,
  field,
  handles,
  step,
  muted = false,
}: {
  x: number
  y: number
  icon: LucideIcon
  label: string
  field?: { label: string; value: string; variable?: boolean }
  handles: Side[]
  step?: Step
  muted?: boolean
}) {
  return (
    <div
      className={cn('absolute rounded-md border bg-card shadow-sm', muted && 'opacity-55')}
      style={{ left: x, top: y, width: NODE_WIDTH, height: field ? 96 : 40 }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{label}</span>
      </div>
      {field && (
        <div className="flex flex-col gap-1 border-t px-3 py-2">
          <span className="text-xs text-muted-foreground">{field.label}</span>
          <span
            className={cn(
              'truncate rounded border px-2 py-0.5 font-mono text-[11px]',
              field.variable && 'text-blue-600'
            )}
          >
            {field.value}
          </span>
        </div>
      )}
      {handles.map((side) => (
        <span
          key={side}
          className={cn('absolute h-[11px] w-[11px] rounded-full border-2', handleClass[side])}
        />
      ))}
      {step !== undefined && (
        <>
          <span className={cn(styles.ring, styles.running, runningClass[step])} />
          <span className={cn(styles.ring, styles.done, doneClass[step])} />
        </>
      )}
    </div>
  )
}

/** A straight edge between two handles, turning green once `step` is done. */
function Edge({
  from: [x1, y1],
  to: [x2, y2],
  step,
  dashed = false,
}: {
  from: [number, number]
  to: [number, number]
  step?: Step
  dashed?: boolean
}) {
  const left = Math.min(x1, x2)
  const top = Math.min(y1, y2)
  const d = `M${x1 - left} ${y1 - top} L${x2 - left} ${y2 - top}`

  return (
    <svg
      className="absolute overflow-visible"
      style={{ left, top }}
      width={Math.max(Math.abs(x2 - x1), 2)}
      height={Math.max(Math.abs(y2 - y1), 2)}
      aria-hidden="true"
    >
      <path
        d={d}
        stroke="#b1b1b7"
        strokeWidth={1.5}
        strokeDasharray={dashed ? '4 4' : undefined}
      />
      {step !== undefined && (
        <path className={doneClass[step]} d={d} stroke="#10b981" strokeWidth={2} />
      )}
    </svg>
  )
}

function EdgeLabel({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <span
      className="absolute rounded border bg-white px-1.5 text-[11px] text-muted-foreground"
      style={{ left: x, top: y }}
    >
      {children}
    </span>
  )
}

/**
 * A static, looping replay of a workflow run, drawn straight onto the hero's
 * dotted canvas: each node turns blue while it runs and green once it
 * succeeds, ending in an "available" result. Pure CSS, no interactivity.
 */
export default function WorkflowAnimation() {
  return (
    <div
      role="img"
      aria-label="A workflow running in the builder: each node turns blue while it runs and green when it succeeds, ending with the plate reported as available"
      className="relative h-[500px] w-[640px]"
    >
      <Edge from={[110, 80]} to={[110, 120]} step={0} />
      <Edge from={[200, 168]} to={[236, 168]} step={1} />
      <Edge from={[416, 168]} to={[452, 168]} step={2} />
      <Edge from={[542, 216]} to={[542, 296]} step={3} />
      <Edge from={[452, 344]} to={[416, 344]} step={4} />
      <Edge from={[542, 392]} to={[542, 440]} dashed />
      <EdgeLabel x={414} y={320}>true</EdgeLabel>
      <EdgeLabel x={552} y={404}>false</EdgeLabel>

      <FlowNode x={20} y={40} icon={Play} label="Start · daily" handles={['bottom']} step={0} />
      <FlowNode
        x={20}
        y={120}
        icon={Globe}
        label="Open page"
        field={{ label: 'URL', value: 'wunschkennzeichen.example' }}
        handles={['top', 'right']}
        step={1}
      />
      <FlowNode
        x={236}
        y={120}
        icon={Keyboard}
        label="Type text"
        field={{ label: 'Text', value: '{{ plate.letters }}', variable: true }}
        handles={['left', 'right']}
        step={2}
      />
      <FlowNode
        x={452}
        y={120}
        icon={MousePointerClick}
        label="Click"
        field={{ label: 'Selector', value: 'button[type=submit]' }}
        handles={['left', 'bottom']}
        step={3}
      />
      <FlowNode
        x={452}
        y={296}
        icon={GitBranch}
        label="Conditional"
        field={{ label: 'Text includes', value: 'verfügbar' }}
        handles={['top', 'left', 'bottom']}
        step={4}
      />
      <FlowNode
        x={236}
        y={324}
        icon={FlagTriangleRight}
        label="End · available"
        handles={['right']}
        step={5}
      />
      <FlowNode
        x={452}
        y={440}
        icon={FlagTriangleRight}
        label="End · not yet"
        handles={['top']}
        muted
      />

      <div
        className={cn(
          'absolute left-5 top-[396px] flex w-[300px] items-center gap-3 rounded-lg border bg-white px-3.5 py-3 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)]',
          styles.toast
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <span>
          <span className="block text-sm font-semibold">HH NJ 42: available</span>
          <span className="block text-[13px] text-muted-foreground">Run finished, result logged</span>
        </span>
      </div>
    </div>
  )
}
