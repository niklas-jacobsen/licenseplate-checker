import { Position, type NodeProps } from '@xyflow/react'
import { Clock } from 'lucide-react'
import type { WaitConfig } from '@licenseplate-checker/shared/workflow-dsl/config'
import { BaseNode, BaseNodeHeader, BaseNodeContent, type BuilderNode } from './base-node'
import { BaseHandle } from './base-handle'
import { useBuilderStore } from '../../store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function WaitNode({ id, data }: NodeProps<BuilderNode>) {
  const updateConfig = useBuilderStore((s) => s.updateNodeConfig)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const config = data.config as WaitConfig

  return (
    <BaseNode className="group/node">
      <BaseNodeHeader
        icon={Clock}
        label={data.label}
        onDelete={() => removeNode(id)}
      />
      <BaseNodeContent>
        <div>
          <label className="text-xs text-muted-foreground">Mode</label>
          <Select
            value={config.mode}
            onValueChange={(v) => {
              if (v === 'duration') {
                updateConfig(id, {
                  mode: 'duration',
                  seconds: 1,
                  selector: undefined,
                  timeoutMs: undefined,
                })
              } else if (v === 'selector') {
                updateConfig(id, {
                  mode: 'selector',
                  selector: '',
                  seconds: undefined,
                  timeoutMs: undefined,
                })
              } else {
                updateConfig(id, {
                  mode: 'newTab',
                  seconds: undefined,
                  selector: undefined,
                  timeoutMs: undefined,
                })
              }
            }}
          >
            <SelectTrigger className="nodrag w-full h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="duration">Wait duration</SelectItem>
              <SelectItem value="selector">Wait for element</SelectItem>
              <SelectItem value="newTab">Wait for new tab</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.mode === 'duration' && (
          <div>
            <label className="text-xs text-muted-foreground">
              Seconds (1-10)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
              value={config.seconds}
              onChange={(e) =>
                updateConfig(id, { seconds: Number(e.target.value) })
              }
            />
          </div>
        )}

        {config.mode === 'selector' && (
          <>
            <div>
              <label className="text-xs text-muted-foreground">Selector</label>
              <input
                className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
                value={config.selector}
                onChange={(e) =>
                  updateConfig(id, { selector: e.target.value })
                }
                placeholder="#element"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Timeout (ms)
              </label>
              <input
                type="number"
                className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
                value={config.timeoutMs ?? ''}
                onChange={(e) =>
                  updateConfig(id, {
                    timeoutMs: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="10000"
              />
            </div>
          </>
        )}

        {config.mode === 'newTab' && (
          <div>
            <label className="text-xs text-muted-foreground">
              Timeout (ms)
            </label>
            <input
              type="number"
              className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
              value={config.timeoutMs ?? ''}
              onChange={(e) =>
                updateConfig(id, {
                  timeoutMs: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="10000"
            />
          </div>
        )}
      </BaseNodeContent>
      <BaseHandle type="target" position={Position.Top} id="in" />
      <BaseHandle type="source" position={Position.Bottom} id="next" />
    </BaseNode>
  )
}
