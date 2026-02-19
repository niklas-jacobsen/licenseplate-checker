'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { workflowService } from '@/services/workflow.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Edit,
  Globe,
  GlobeLock,
  Loader2,
  MoreVertical,
  Play,
  Trash2,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
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

interface Execution {
  id: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  startedAt: string
  finishedAt?: string | null
  duration?: number
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
  const router = useRouter()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchWorkflow()
  }, [id])

  const fetchWorkflow = async () => {
    try {
      setLoading(true)
      const res = await workflowService.getById(id)
      if (res.data && res.data.workflow) {
        setWorkflow(res.data.workflow)
        setEditName(res.data.workflow.name)
        setEditDescription(res.data.workflow.description || '')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load workflow')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!workflow) return
    try {
      setIsSaving(true)
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
      }
    } catch (err) {
      console.error(err)
      // todo add error toast or mesesage
    } finally {
      setIsSaving(false)
    }
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

  if (loading) {
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
    <div className="container mx-auto py-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/workflows')}
            className="pl-0 hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {workflow.name}
              </h1>
              <Badge
                variant="outline"
                className={`gap-1 ${
                  workflow.isPublished
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
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
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>{workflow.city.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  Last updated {format(new Date(workflow.updatedAt), 'PP p')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => router.push(`/builder?id=${workflow.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Definition
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

      {/* Description */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          {workflow.description ? (
            <p className="text-muted-foreground whitespace-pre-wrap">
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
        </div>
        <Card className="py-0">
          <CardContent className="p-0">
            {workflow.executions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No executions recorded yet.
              </div>
            ) : (
              <div className="divide-y">
                {workflow.executions.map((exec) => (
                  <div
                    key={exec.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusBadge(exec.status)}
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {format(new Date(exec.startedAt), 'PP p')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: {exec.id}
                        </span>
                      </div>
                    </div>
                    {exec.duration && (
                      <span className="text-sm text-muted-foreground">
                        {(exec.duration / 1000).toFixed(2)}s
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditDescription(e.target.value)
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              Are you sure you want to delete <strong>{workflow.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
  )
}
