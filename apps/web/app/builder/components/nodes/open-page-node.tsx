import { useRef } from 'react'
import { Position, type NodeProps } from '@xyflow/react'
import { Globe } from 'lucide-react'
import { BaseNode, BaseNodeHeader, BaseNodeContent, type BuilderNode } from './base-node'
import { BaseHandle } from './base-handle'
import { useBuilderStore } from '../../store'
import { VariablePicker } from '../variable-picker'

export function OpenPageNode({ id, data }: NodeProps<BuilderNode>) {
  const updateConfig = useBuilderStore((s) => s.updateNodeConfig)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const inputRef = useRef<HTMLInputElement>(null)

  const insertVariable = (template: string) => {
    const input = inputRef.current
    if (!input) {
      updateConfig(id, { url: (data.config as { url: string }).url + template })
      return
    }
    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? start
    const value = input.value.slice(0, start) + template + input.value.slice(end)
    updateConfig(id, { url: value })
    requestAnimationFrame(() => {
      input.focus()
      input.setSelectionRange(start + template.length, start + template.length)
    })
  }

  return (
    <BaseNode className="group/node">
      <BaseNodeHeader
        icon={Globe}
        label={data.label}
        onDelete={() => removeNode(id)}
      />
      <BaseNodeContent>
        <label className="text-xs text-muted-foreground">URL</label>
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
            value={(data.config as { url: string }).url}
            onChange={(e) => updateConfig(id, { url: e.target.value })}
            placeholder="https://example.com"
          />
          <VariablePicker onInsert={insertVariable} />
        </div>
      </BaseNodeContent>
      <BaseHandle type="target" position={Position.Top} id="in" />
      <BaseHandle type="source" position={Position.Bottom} id="next" />
    </BaseNode>
  )
}
