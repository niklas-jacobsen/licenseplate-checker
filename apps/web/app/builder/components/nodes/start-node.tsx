import { Position, type NodeProps } from '@xyflow/react'
import { Play, ExternalLink } from 'lucide-react'
import { BaseNode, BaseNodeHeader, BaseNodeContent, type BuilderNode } from './base-node'
import { BaseHandle } from './base-handle'
import { Button } from '@/components/ui/button'
import { useBuilderStore } from '../../store'

export function StartNode({ data }: NodeProps<BuilderNode>) {
  const websiteUrl = useBuilderStore((s) => s.websiteUrl)

  return (
    <BaseNode className="group/node">
      <BaseNodeHeader icon={Play} label={data.label} />
      {websiteUrl && (
        <BaseNodeContent>
          <div>
            <label className="text-xs text-muted-foreground">Website URL</label>
            <div className="flex items-center gap-1">
              <input
                className="nodrag flex-1 text-xs border rounded px-2 py-1 bg-muted text-muted-foreground cursor-default"
                value={websiteUrl}
                readOnly
                tabIndex={-1}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="nodrag h-6 w-6 shrink-0"
                title="Open in new tab"
                asChild
              >
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </BaseNodeContent>
      )}
      <BaseHandle type="source" position={Position.Bottom} id="next" />
    </BaseNode>
  )
}
