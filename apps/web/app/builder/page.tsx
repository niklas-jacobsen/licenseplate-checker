'use client'

import NavBar from '@/components/nav-bar'
import { useCallback, useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ReactFlow,
  Background as BackgroundComponent,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react'

import type { CoreNodeType } from '@licenseplate-checker/shared/workflow-dsl/types'
import { WORKFLOW_NAME_MAX_LENGTH } from '@licenseplate-checker/shared/constants/limits'
import { PALETTE_NODES } from './config'
import { BuilderStoreProvider, useBuilderStore, useShallow } from './store'
import { nodeTypes } from './components/nodes'
import { edgeTypes } from './components/edges'

import '@xyflow/react/dist/style.css'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, ArrowLeft, Loader2, Pencil, Check } from 'lucide-react'

const Background = BackgroundComponent as any

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
      </div>
    </Card>
  )
}

function FlowCanvas() {
  const { screenToFlowPosition, getViewport } = useReactFlow()

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNodeByType,
    setSelectedNodeId,
  } = useBuilderStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      onConnect: s.onConnect,
      addNodeByType: s.addNodeByType,
      setSelectedNodeId: s.setSelectedNodeId,
    }))
  )

  const onSelectionChange = useCallback(
    (payload: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodeId(payload.nodes[0]?.id ?? null)
    },
    [setSelectedNodeId]
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
      addNodeByType(type, pos)
    },
    [getViewport, screenToFlowPosition, addNodeByType]
  )

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'workflow', animated: true }}
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

function BuilderToolbar() {
  const router = useRouter()

  const {
    workflowId,
    workflowName,
    isSaving,
    saveError,
    saveWorkflow,
    renameWorkflow,
  } = useBuilderStore(
    useShallow((s) => ({
      workflowId: s.workflowId,
      workflowName: s.workflowName,
      isSaving: s.isSaving,
      saveError: s.saveError,
      saveWorkflow: s.saveWorkflow,
      renameWorkflow: s.renameWorkflow,
    }))
  )

  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [renameError, setRenameError] = useState('')

  const handleRename = async () => {
    if (!newName.trim() || newName === workflowName) {
      setIsEditingName(false)
      setNewName(workflowName)
      setRenameError('')
      return
    }

    setRenameError('')
    const result = await renameWorkflow(newName)

    if (result.success) {
      setIsEditingName(false)
    } else {
      setRenameError(result.error || 'Failed to rename')
      setNewName(workflowName)
    }
  }

  return (
    <div className="flex items-center justify-between border-b bg-white px-4 py-2">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/workflows/${workflowId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="h-5 w-px bg-border" />

        {isEditingName ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={WORKFLOW_NAME_MAX_LENGTH}
                className={`h-7 w-48 pr-7 text-sm ${renameError ? 'border-destructive' : ''}`}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename()
                  if (e.key === 'Escape') {
                    setNewName(workflowName)
                    setIsEditingName(false)
                    setRenameError('')
                  }
                }}
                onBlur={handleRename}
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleRename()
                }}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </button>
            </div>
            {renameError && (
              <span className="text-xs text-destructive whitespace-nowrap">
                {renameError}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <span className="text-sm font-medium">{workflowName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
              onClick={() => {
                setNewName(workflowName)
                setIsEditingName(true)
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {saveError && (
          <span className="text-xs text-destructive">{saveError}</span>
        )}
        {workflowId && (
          <Button size="sm" onClick={saveWorkflow} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        )}
      </div>
    </div>
  )
}

function BuilderContent() {
  const searchParams = useSearchParams()
  const workflowId = searchParams.get('id')

  return (
    <BuilderStoreProvider workflowId={workflowId}>
      <BuilderInner />
    </BuilderStoreProvider>
  )
}

function BuilderInner() {
  const { workflowId, isLoading, loadWorkflow } = useBuilderStore(
    useShallow((s) => ({
      workflowId: s.workflowId,
      isLoading: s.isLoading,
      loadWorkflow: s.loadWorkflow,
    }))
  )

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId)
    }
  }, [workflowId, loadWorkflow])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <NavBar />
      <BuilderToolbar />

      <div className="relative h-full w-full flex-1">
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  )
}
