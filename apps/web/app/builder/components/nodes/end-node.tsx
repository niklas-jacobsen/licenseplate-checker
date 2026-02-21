import { Position, type NodeProps } from '@xyflow/react'
import { Flag } from 'lucide-react'
import type { EndConfig } from '@licenseplate-checker/shared/workflow-dsl/config'
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

export function EndNode({ id, data }: NodeProps<BuilderNode>) {
  const updateConfig = useBuilderStore((s) => s.updateNodeConfig)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const config = data.config as EndConfig

  return (
    <BaseNode className="group/node">
      <BaseNodeHeader
        icon={Flag}
        label={data.label}
        onDelete={() => removeNode(id)}
      />
      <BaseNodeContent>
        <div>
          <label className="text-xs text-muted-foreground">Outcome</label>
          <Select
            value={config.outcome}
            onValueChange={(v) => updateConfig(id, { outcome: v })}
          >
            <SelectTrigger className="nodrag w-full h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </BaseNodeContent>
      <BaseHandle type="target" position={Position.Top} id="in" />
    </BaseNode>
  )
}
