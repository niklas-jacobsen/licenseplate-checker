import { useRef } from 'react'
import { Position, type NodeProps } from '@xyflow/react'
import { Keyboard } from 'lucide-react'
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeContent,
  type BuilderNode,
} from './base-node'
import { BaseHandle } from './base-handle'
import { useBuilderStore } from '../../store'
import { VariablePicker } from '../variable-picker'

export function TypeTextNode({ id, data }: NodeProps<BuilderNode>) {
  const updateConfig = useBuilderStore((s) => s.updateNodeConfig)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const config = data.config as { selector: string; text: string }
  const textRef = useRef<HTMLInputElement>(null)

  const insertVariable = (template: string) => {
    const input = textRef.current
    if (!input) {
      updateConfig(id, { text: config.text + template })
      return
    }
    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? start
    const value = input.value.slice(0, start) + template + input.value.slice(end)
    updateConfig(id, { text: value })
    requestAnimationFrame(() => {
      input.focus()
      input.setSelectionRange(start + template.length, start + template.length)
    })
  }

  return (
    <BaseNode className="group/node">
      <BaseNodeHeader
        icon={Keyboard}
        label={data.label}
        onDelete={() => removeNode(id)}
      />
      <BaseNodeContent>
        <div>
          <label className="text-xs text-muted-foreground">Selector</label>
          <input
            className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
            value={config.selector}
            onChange={(e) => updateConfig(id, { selector: e.target.value })}
            placeholder="#input-field"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Text</label>
          <div className="flex items-center gap-1">
            <input
              ref={textRef}
              className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
              value={config.text}
              onChange={(e) => updateConfig(id, { text: e.target.value })}
              placeholder="Text to type..."
            />
            <VariablePicker onInsert={insertVariable} />
          </div>
        </div>
      </BaseNodeContent>
      <BaseHandle type="target" position={Position.Top} id="in" />
      <BaseHandle type="source" position={Position.Bottom} id="next" />
    </BaseNode>
  )
}
