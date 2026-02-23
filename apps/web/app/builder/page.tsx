'use client'

import NavBar from '@/components/nav-bar'
import { useCallback, useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-context'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TestDialog } from './components/test-dialog'
import {
  Save,
  ArrowLeft,
  Loader2,
  Pencil,
  Check,
  Upload,
  CheckCircle,
  XCircle,
  Undo2,
  Redo2,
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
    takeSnapshot,
    undo,
    redo,
  } = useBuilderStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      onConnect: s.onConnect,
      addNodeByType: s.addNodeByType,
      setSelectedNodeId: s.setSelectedNodeId,
      takeSnapshot: s.takeSnapshot,
      undo: s.undo,
      redo: s.redo,
    }))
  )

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  const onNodeDragStart = useCallback(() => {
    takeSnapshot()
  }, [takeSnapshot])

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
        onNodeDragStart={onNodeDragStart}
        onSelectionDragStart={onNodeDragStart}
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
    saveWorkflowAndUnpublish,
    checkHasContentChanges,
    renameWorkflow,
    canPublish,
    isPublished,
    isPublishing,
    originallyPublished,
    testsRemaining,
    publishWorkflow,
    unpublishWorkflow,
    isDirty,
    undo,
    redo,
    past,
    future,
  } = useBuilderStore(
    useShallow((s) => ({
      workflowId: s.workflowId,
      workflowName: s.workflowName,
      isSaving: s.isSaving,
      saveError: s.saveError,
      saveWorkflow: s.saveWorkflow,
      saveWorkflowAndUnpublish: s.saveWorkflowAndUnpublish,
      checkHasContentChanges: s.checkHasContentChanges,
      renameWorkflow: s.renameWorkflow,
      canPublish: s.canPublish,
      isPublished: s.isPublished,
      isPublishing: s.isPublishing,
      originallyPublished: s.originallyPublished,
      testsRemaining: s.testsRemaining,
      publishWorkflow: s.publishWorkflow,
      unpublishWorkflow: s.unpublishWorkflow,
      isDirty: s.isDirty,
      undo: s.undo,
      redo: s.redo,
      past: s.past,
      future: s.future,
    }))
  )

  const [showSaveWarning, setShowSaveWarning] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [showLeaveWarning, setShowLeaveWarning] = useState(false)

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleBack = () => {
    if (isDirty) {
      setShowLeaveWarning(true)
    } else {
      router.push(`/workflows/${workflowId}`)
    }
  }

  const handleSaveClick = () => {
    if (originallyPublished && checkHasContentChanges()) {
      setShowSaveWarning(true)
    } else {
      saveWorkflow()
    }
  }

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
          onClick={handleBack}
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

      <div className="flex items-center gap-1">
        {saveError && (
          <span className="text-xs text-destructive mr-1">{saveError}</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={undo}
          disabled={past.length === 0}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={redo}
          disabled={future.length === 0}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        {workflowId && (
          <>
            <div className="h-5 w-px bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveClick}
              disabled={isSaving}
            >
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
                variant="ghost"
                size="sm"
                className="group/pub text-teal-700 hover:text-red-700 hover:bg-red-50"
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
                variant="ghost"
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

      <AlertDialog open={showSaveWarning} onOpenChange={setShowSaveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Saving will unpublish this workflow</AlertDialogTitle>
            <AlertDialogDescription>
              This workflow is currently published. Saving your changes will unpublish it,
              as the updated version has not been validated yet. You can run a test and
              confirm the outcome to re-enable publishing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="outline"
              disabled={testsRemaining === 0}
              onClick={() => {
                setShowSaveWarning(false)
                setShowTestDialog(true)
              }}
            >
              {testsRemaining === 0 ? 'No test executions remaining' : 'Test first'}
            </Button>
            <AlertDialogAction onClick={saveWorkflowAndUnpublish}>
              Save & Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TestDialog open={showTestDialog} onOpenChange={setShowTestDialog} />

      <AlertDialog open={showLeaveWarning} onOpenChange={setShowLeaveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Leaving now will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(`/workflows/${workflowId}`)}>
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
