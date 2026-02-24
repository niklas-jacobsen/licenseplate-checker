'use client'

import { useMemo } from 'react'
import {
  parseTemplate,
  segmentsToString,
  extractVariableKeys,
  TEMPLATE_VARIABLES,
  type Segment,
} from '@licenseplate-checker/shared/template-variables'
import { VariablePicker } from './variable-picker'
import { useBuilderStore } from '../store'
import { X } from 'lucide-react'

const MAX_VARIABLES_PER_FIELD = 2

function labelForKey(key: string): string {
  return TEMPLATE_VARIABLES.find((v) => v.key === key)?.label ?? key
}

// only scan config keys that actually support template vars
const VARIABLE_CONFIG_KEYS = new Set(['text', 'value'])

export function useUsedVariableKeys(
  excludeNodeId: string,
  excludeConfigKey: string
): Set<string> {
  const nodes = useBuilderStore((s) => s.nodes)
  return useMemo(() => {
    const used = new Set<string>()
    for (const node of nodes) {
      const config = node.data.config as Record<string, unknown>
      for (const [key, value] of Object.entries(config)) {
        if (!VARIABLE_CONFIG_KEYS.has(key)) continue
        if (typeof value !== 'string') continue
        if (node.id === excludeNodeId && key === excludeConfigKey) continue
        for (const varKey of extractVariableKeys(value)) {
          used.add(varKey)
        }
      }
    }
    return used
  }, [nodes, excludeNodeId, excludeConfigKey])
}

export function VariableInput({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: boolean
}) {
  const segments = useMemo(() => parseTemplate(value), [value])

  const updateSegment = (index: number, newValue: string) => {
    const updated = segments.map((s, i) =>
      i === index && s.type === 'text' ? { ...s, value: newValue } : s
    )
    onChange(segmentsToString(updated))
  }

  const removeVariable = (index: number) => {
    const updated: Segment[] = []
    for (let i = 0; i < segments.length; i++) {
      if (i === index) continue
      const prev = updated[updated.length - 1]
      const seg = segments[i]
      if (prev?.type === 'text' && seg.type === 'text') {
        updated[updated.length - 1] = {
          type: 'text',
          value: prev.value + seg.value,
        }
      } else {
        updated.push(seg)
      }
    }
    if (updated.length === 0) {
      updated.push({ type: 'text', value: '' })
    }
    onChange(segmentsToString(updated))
  }

  const showPlaceholder =
    segments.length === 1 &&
    segments[0].type === 'text' &&
    segments[0].value === ''

  return (
    <div className={`nodrag flex items-center flex-wrap gap-0 border rounded px-1.5 py-0.5 bg-background min-h-7 focus-within:ring-1 focus-within:ring-ring flex-1 ${error ? 'border-destructive' : ''}`}>
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <input
            key={`text-${i}`}
            className={`border-none outline-none bg-transparent text-xs min-w-[2ch] flex-shrink ${showPlaceholder ? 'flex-1' : ''}`}
            style={
              showPlaceholder
                ? undefined
                : { width: `${Math.max(2, seg.value.length + 1)}ch` }
            }
            value={seg.value}
            onChange={(e) => updateSegment(i, e.target.value)}
            placeholder={showPlaceholder ? placeholder : undefined}
          />
        ) : (
          <span
            key={`var-${seg.key}`}
            className="inline-flex items-center gap-0.5 bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap"
          >
            {labelForKey(seg.key)}
            <button
              type="button"
              className="hover:bg-primary/20 rounded-sm p-px"
              onClick={() => removeVariable(i)}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        )
      )}
    </div>
  )
}

export function VariableField({
  value,
  onChange,
  placeholder,
  nodeId,
  configKey,
  error,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  nodeId: string
  configKey: string
  error?: boolean
}) {
  const disabledKeys = useUsedVariableKeys(nodeId, configKey)
  const variableCount = extractVariableKeys(value).length

  return (
    <div className="flex items-center gap-1">
      <VariableInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
      />
      <VariablePicker
        onInsert={(template) => onChange(value + template)}
        disabledKeys={disabledKeys}
        disabled={variableCount >= MAX_VARIABLES_PER_FIELD}
      />
    </div>
  )
}
