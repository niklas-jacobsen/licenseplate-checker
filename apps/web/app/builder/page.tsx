'use client'

import NavBar from '@/components/nav-bar'
import { useCallback, useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
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
import { BuilderStoreProvider, useBuilderStore, useShallow } from './store'
import { nodeTypes } from './components/nodes'
import { edgeTypes } from './components/edges'
import { BottomPalette } from './components/bottom-palette'
import { ExecutionErrorBanner } from './components/execution-error-banner'
import { OutcomeToast } from './components/outcome-toast'
import { useDragAndDrop } from './hooks/useDragAndDrop'

import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Save,
  ArrowLeft,
  Loader2,
  Pencil,
  Check,
  Upload,
  CheckCircle,
  XCircle,
} from 'lucide-react'

// biome-ignore lint/suspicious/noExplicitAny:
const Background = BackgroundComponent as any

function FlowCanvas() {
  const { screenToFlowPosition, getViewport } = useReactFlow()
  const { onDrop, onDragOver } = useDragAndDrop()

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
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        attributionPosition="bottom-right"
      >
        <Background gap={18} />
        <ExecutionErrorBanner />
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
    canPublish,
    isPublished,
    isPublishing,
    publishWorkflow,
    unpublishWorkflow,
  } = useBuilderStore(
    useShallow((s) => ({
      workflowId: s.workflowId,
      workflowName: s.workflowName,
      isSaving: s.isSaving,
      saveError: s.saveError,
      saveWorkflow: s.saveWorkflow,
      renameWorkflow: s.renameWorkflow,
      canPublish: s.canPublish,
      isPublished: s.isPublished,
      isPublishing: s.isPublishing,
      publishWorkflow: s.publishWorkflow,
      unpublishWorkflow: s.unpublishWorkflow,
    }))
  )

  const [justSaved, setJustSaved] = useState(false)
  const prevSavingRef = useRef(false)

  useEffect(() => {
    if (prevSavingRef.current && !isSaving && !saveError) {
      setJustSaved(true)
      const timer = setTimeout(() => setJustSaved(false), 2000)
      return () => clearTimeout(timer)
    }
    prevSavingRef.current = isSaving
  }, [isSaving, saveError])

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
          <>
            <Button size="sm" onClick={saveWorkflow} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : justSaved ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {justSaved ? 'Saved' : 'Save'}
            </Button>
            {isPublished ? (
              <Button
                size="sm"
                variant="outline"
                className="group/pub bg-teal-100 text-teal-800 border-teal-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                onClick={unpublishWorkflow}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1 group-hover/pub:hidden" />
                    <XCircle className="h-4 w-4 mr-1 hidden group-hover/pub:block" />
                  </>
                )}
                <span className="group-hover/pub:hidden">Published</span>
                <span className="hidden group-hover/pub:inline">Unpublish</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={publishWorkflow}
                disabled={!canPublish || isPublishing}
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Upload className="h-4 w-4 mr-1" />
                )}
                Publish
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function BuilderContent() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const workflowId = searchParams.get('id')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/builder${workflowId ? `?id=${workflowId}` : ''}`)
    }
  }, [user, authLoading, router, workflowId])

  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <BuilderStoreProvider workflowId={workflowId}>
      <BuilderInner />
    </BuilderStoreProvider>
  )
}

function BuilderInner() {
  const router = useRouter()
  const { workflowId, isLoading, notFound, loadWorkflow } = useBuilderStore(
    useShallow((s) => ({
      workflowId: s.workflowId,
      isLoading: s.isLoading,
      notFound: s.notFound,
      loadWorkflow: s.loadWorkflow,
    }))
  )

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId)
    }
  }, [workflowId, loadWorkflow])

  useEffect(() => {
    if (notFound) {
      router.replace('/workflows')
    }
  }, [notFound, router])

  if (isLoading || notFound) {
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
      <OutcomeToast />
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
