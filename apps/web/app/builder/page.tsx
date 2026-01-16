'use client'

import NavBar from 'apps/web/components/nav-bar'
import { useCallback, useState } from 'react'
import {
  ReactFlow,
  Background as BackgroundComponent,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'

import type { WorkflowNode, CoreNodeType } from '@shared/workflow-dsl/types'
import { nodeRegistry } from '@shared/node-registry'
import { PALETTE_NODES } from './config'

import '@xyflow/react/dist/style.css'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from 'apps/web/components/ui/card'
import { Button } from 'apps/web/components/ui/button'

const Background = BackgroundComponent as any

const initialNodes: WorkflowNode[] = [
  {
    id: 'start',
    type: 'core.start',
    position: { x: 120, y: 140 },
    data: { label: 'Start', config: {} },
  },
  {
    id: 'end',
    type: 'core.end',
    position: { x: 560, y: 140 },
    data: { label: 'End', config: {} },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'start-end',
    source: 'start',
    target: 'end',
    sourceHandle: 'next',
    targetHandle: 'in',
    type: 'smoothstep',
  },
]

function createNode(
  type: CoreNodeType,
  position: { x: number; y: number }
): WorkflowNode {
  const id = `${type}-${crypto.randomUUID()}`
  const label = nodeRegistry[type]?.label ?? 'Node'

  switch (type) {
    case 'core.click':
      return {
        id,
        type: 'core.click',
        position,
        data: {
          label,
          config: { selector: '' },
        },
      }

    case 'core.typeText':
      return {
        id,
        type: 'core.typeText',
        position,
        data: {
          label,
          config: { selector: '', text: '' },
        },
      }

    case 'core.openPage':
      return {
        id,
        type: 'core.openPage',
        position,
        data: {
          label,
          config: { url: '' },
        },
      }

    case 'core.conditional':
      return {
        id,
        type: 'core.conditional',
        position,
        data: {
          label,
          config: { operator: 'exists', selector: '' },
        },
      }

    case 'core.start':
      return {
        id,
        type: 'core.start',
        position,
        data: { label, config: {} },
      }

    case 'core.end':
      return {
        id,
        type: 'core.end',
        position,
        data: { label, config: {} },
      }

    default:
      //should never be reached
      throw new Error(`Unknown node type: ${type}`)
  }
}

function BottomPalette({ onAdd }: { onAdd: (type: CoreNodeType) => void }) {
  return (
    <Card className="nopan absolute bottom-6 left-1/2 z-20 flex w-fit -translate-x-1/2 flex-row items-center gap-2 rounded-full border bg-background/90 p-2 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-1">
        {PALETTE_NODES.map((node) => (
          <Button
            key={node.type}
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => onAdd(node.type)}
          >
            {node.label}
          </Button>
        ))}
      </div>

      <div className="mx-2 h-6 w-px bg-border" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground"
        >
          Test
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground"
        >
          Exit
        </Button>
      </div>
    </Card>
  )
}

function OptionsSidebar({
  selectedNode,
  onClose,
}: {
  selectedNode: WorkflowNode | null
  onClose: () => void
}) {
  const isOpen = !!selectedNode

  return (
    <Card
      className={[
        'absolute bottom-4 right-4 top-4 z-20 w-80',
        'flex flex-col shadow-2xl transition-transform duration-300 ease-in-out',
        'border bg-background/95 backdrop-blur-sm',
        isOpen ? 'translate-x-0' : 'translate-x-[120%]',
      ].join(' ')}
    >
      <CardHeader>
        <CardTitle>Node Options</CardTitle>
        <CardDescription>
          {selectedNode ? selectedNode.data.label : 'Select a node'}
        </CardDescription>

        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={onClose}
          >
            ✕
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {selectedNode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase text-muted-foreground">
                Type
              </label>
              <div className="rounded-md border bg-muted/30 p-2 text-sm font-medium">
                {selectedNode.type}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase text-muted-foreground">
                Config
              </label>
              <div className="rounded-md border border-dashed p-4 text-xs text-muted-foreground">
                Form fields for <strong>{selectedNode.type}</strong> will be
                rendered here.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No node selected
          </div>
        )}
      </CardContent>

      {selectedNode && (
        <CardFooter className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Duplicate
          </Button>
          <Button variant="destructive" className="flex-1 text-white">
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

function FlowCanvas({
  nodes,
  edges,
  setNodes,
  setEdges,
  onSelectNode,
}: {
  nodes: WorkflowNode[]
  edges: Edge[]
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  onSelectNode: (node: WorkflowNode | null) => void
}) {
  const { screenToFlowPosition, getViewport } = useReactFlow()

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes(
        (snapshot) => applyNodeChanges(changes, snapshot) as WorkflowNode[]
      ),
    [setNodes]
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((snapshot) => applyEdgeChanges(changes, snapshot) as Edge[]),
    [setEdges]
  )

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((snapshot) =>
        addEdge({ ...params, type: 'smoothstep' }, snapshot)
      ),
    [setEdges]
  )

  const onSelectionChange = useCallback(
    (payload: { nodes: Node[]; edges: Edge[] }) => {
      onSelectNode(payload.nodes[0] ? (payload.nodes[0] as WorkflowNode) : null)
    },
    [onSelectNode]
  )

  const addNodeFromPalette = useCallback(
    (type: CoreNodeType) => {
      const _vp = getViewport()
      const centerScreen = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }
      const navbarOffset = 64
      const adjusted = {
        x: centerScreen.x,
        y: centerScreen.y - navbarOffset / 2,
      }

      const pos = screenToFlowPosition(adjusted)
      const newNode = createNode(type, pos)
      setNodes((prev) => [...prev, newNode])
    },
    [getViewport, screenToFlowPosition, setNodes]
  )

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background gap={18} />
        <BottomPalette onAdd={addNodeFromPalette} />
      </ReactFlow>
    </div>
  )
}

function FlowWithProvider(props: {
  nodes: WorkflowNode[]
  edges: Edge[]
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  onSelectNode: (node: WorkflowNode | null) => void
}) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  )
}

export default function BuilderPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <NavBar />

      <div className="relative h-full w-full flex-1">
        <FlowWithProvider
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          onSelectNode={setSelectedNode}
        />

        <OptionsSidebar
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  )
}
