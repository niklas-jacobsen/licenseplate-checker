'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { workflowService } from '@/services/workflow.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Edit,
  Globe,
  GlobeLock,
  Loader2,
  MoreVertical,
  Trash2,
  X,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import NavBar from '@/components/nav-bar'
import {
  WORKFLOW_NAME_MAX_LENGTH,
  WORKFLOW_DESCRIPTION_MAX_LENGTH,
} from '@licenseplate-checker/shared/constants/limits'

interface ExecutionLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  details?: unknown
}

interface Execution {
  id: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  startedAt: string
  finishedAt?: string | null
  duration?: number
  result?: { success?: boolean; error?: string; outcome?: string } | null
  errorNodeId?: string | null
  logs?: ExecutionLog[] | null
  check?: { cityId: string; letters: string; numbers: number } | null
}

interface Workflow {
  id: string
  name: string
  description: string | null
  cityId: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  city: { name: string }
  executions: Execution[]
}

export default function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const runParam = searchParams.get('run')
  const [hideTestRuns, setHideTestRuns] = useState(!runParam)
  const [expandedRunId, setExpandedRunId] = useState<string | null>(runParam)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/workflows/${id}`)
    }
  }, [user, authLoading, router, id])

  useEffect(() => {
    if (user) fetchWorkflow()
  }, [id, user])

  const fetchWorkflow = async () => {
    try {
      setLoading(true)
      const res = await workflowService.getById(id)
      if (res.data && res.data.workflow) {
        setWorkflow(res.data.workflow)
        setEditName(res.data.workflow.name)
        setEditDescription(res.data.workflow.description || '')
      } else if (res.status === 404) {
        router.replace('/workflows')
        return
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load workflow')
    } finally {
      setLoading(false)
    }
  }

  const [editError, setEditError] = useState('')

  const handleUpdate = async () => {
    if (!workflow) return
    setIsSaving(true)
    setEditError('')

    const res = await workflowService.update(id, {
      name: editName,
      description: editDescription,
    })

    const updated = res.data?.workflow
    if (updated) {
      setWorkflow((prev) =>
        prev
          ? {
              ...prev,
              name: updated.name,
              description: updated.description,
              updatedAt: updated.updatedAt,
            }
          : null
      )
      setIsEditOpen(false)
    } else {
      setEditError(res.error || 'Failed to update workflow')
    }

    setIsSaving(false)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await workflowService.deleteWorkflow(id)
      router.push('/workflows')
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-600">
            <Check className="h-3 w-3" />
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-600">
            <X className="h-3 w-3" />
          </span>
        )
      case 'RUNNING':
        return (
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600">
            <Loader2 className="h-3 w-3 animate-spin" />
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 text-gray-500">
            <Clock className="h-3 w-3" />
          </span>
        )
    }
  }

  if (authLoading || !user || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-destructive">{error || 'Workflow not found'}</p>
        <Button onClick={() => router.push('/workflows')}>
          Back to Workflows
        </Button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/workflows')}
              className="pl-0 hover:bg-transparent hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {workflow.name}
                  </h1>
                  <Badge
                    variant="outline"
                    className={`gap-1 ${
                      workflow.isPublished
                        ? 'bg-teal-100 text-teal-800 border-teal-300'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {workflow.isPublished ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <GlobeLock className="h-3 w-3" />
                    )}
                    {workflow.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{workflow.city.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      Last updated{' '}
                      {format(new Date(workflow.updatedAt), 'PP p')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push(`/builder?id=${workflow.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Open in Builder
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      Delete Workflow
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent className="mt-[-20]">
              {workflow.description ? (
                <p className="text-muted-foreground whitespace-pre-wrap wrap-break-word">
                  {workflow.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No description provided.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Runs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Runs</h2>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideTestRuns}
                  onChange={(e) => setHideTestRuns(e.target.checked)}
                  className="accent-primary h-3.5 w-3.5"
                />
                Hide test runs
              </label>
            </div>
            <Card className="py-0">
              <CardContent className="p-0">
                {workflow.executions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No executions recorded yet.
                  </div>
                ) : workflow.executions.filter(
                    (e) => !hideTestRuns || e.check != null
                  ).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No production runs yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {workflow.executions
                      .filter((exec) => !hideTestRuns || exec.check != null)
                      .map((exec) => {
                        const isExpanded = expandedRunId === exec.id
                        const infoLogs = exec.logs?.filter(
                          (l) => l.level === 'info'
                        )
                        return (
                          <div key={exec.id}>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRunId(isExpanded ? null : exec.id)
                              }
                              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors gap-4 w-full text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                {getStatusBadge(exec.status)}
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-sm">
                                      {format(new Date(exec.startedAt), 'PP p')}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(
                                        new Date(exec.startedAt),
                                        { addSuffix: true }
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {exec.check ? (
                                      <span className="font-mono">
                                        {exec.check.cityId.toUpperCase()}-
                                        {exec.check.letters}-
                                        {exec.check.numbers}
                                      </span>
                                    ) : (
                                      <span className="text-amber-600 font-medium">
                                        Test Run
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                {exec.status === 'SUCCESS' && (
                                  <span className="text-xs text-green-600">
                                    Completed
                                  </span>
                                )}
                                {exec.status === 'FAILED' && (
                                  <span className="text-xs text-red-600 max-w-48 truncate">
                                    {exec.errorNodeId
                                      ? `Failed on ${exec.errorNodeId}`
                                      : exec.result?.error || 'Failed'}
                                  </span>
                                )}
                                {exec.status === 'RUNNING' && (
                                  <span className="text-xs text-blue-600">
                                    Running
                                  </span>
                                )}
                                {exec.status === 'PENDING' && (
                                  <span className="text-xs text-muted-foreground">
                                    Pending
                                  </span>
                                )}
                                {exec.duration != null && (
                                  <span className="text-xs text-muted-foreground tabular-nums">
                                    {(exec.duration / 1000).toFixed(1)}s
                                  </span>
                                )}
                                <ChevronDown
                                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4 pt-0">
                                <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                                  {/* summary */}
                                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                                    {exec.result?.outcome && (
                                      <span>
                                        Outcome:{' '}
                                        <span className="font-medium text-foreground capitalize">
                                          {exec.result.outcome}
                                        </span>
                                      </span>
                                    )}
                                    {exec.finishedAt && (
                                      <span>
                                        Finished:{' '}
                                        {format(
                                          new Date(exec.finishedAt),
                                          'PP p'
                                        )}
                                      </span>
                                    )}
                                    {exec.duration != null && (
                                      <span>
                                        Duration:{' '}
                                        {(exec.duration / 1000).toFixed(1)}s
                                      </span>
                                    )}
                                  </div>

                                  {/* errors */}
                                  {exec.result?.error && (
                                    <div className="text-xs bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2">
                                      {exec.errorNodeId && (
                                        <span className="font-medium">
                                          Node {exec.errorNodeId}:{' '}
                                        </span>
                                      )}
                                      {exec.result.error}
                                    </div>
                                  )}

                                  {/* timeline */}
                                  {infoLogs && infoLogs.length > 0 ? (
                                    <div className="space-y-0">
                                      <span className="text-xs font-medium text-muted-foreground">
                                        Execution Log
                                      </span>
                                      <div className="mt-1.5">
                                        {infoLogs.map((log, i) => (
                                          <div
                                            key={`${exec.id}-log-${i}`}
                                            className="flex gap-3"
                                          >
                                            <div className="flex flex-col items-center w-2 shrink-0">
                                              {i > 0 ? (
                                                <div className="w-px flex-1 bg-muted-foreground/20" />
                                              ) : (
                                                <div className="flex-1" />
                                              )}
                                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                                              {i < infoLogs.length - 1 ? (
                                                <div className="w-px flex-1 bg-muted-foreground/20" />
                                              ) : (
                                                <div className="flex-1" />
                                              )}
                                            </div>
                                            <span className="text-xs text-muted-foreground font-mono py-1">
                                              {log.message}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                      No logs available
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Dialog */}
          <Dialog
            open={isEditOpen}
            onOpenChange={(open) => {
              setIsEditOpen(open)
              if (!open) {
                setEditError('')
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Workflow Details</DialogTitle>
                <DialogDescription>
                  Update the name and description of your workflow.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={WORKFLOW_NAME_MAX_LENGTH}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setEditDescription(
                        e.target.value.slice(0, WORKFLOW_DESCRIPTION_MAX_LENGTH)
                      )
                    }
                    rows={4}
                  />
                  <span className="text-xs text-muted-foreground text-right">
                    {editDescription.length}/{WORKFLOW_DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>
              </div>
              {editError && (
                <p className="text-sm text-destructive">{editError}</p>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{' '}
                  <strong>{workflow.name}</strong>? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </main>
  )
}
