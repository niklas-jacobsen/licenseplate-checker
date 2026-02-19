'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { format } from 'date-fns'
import { Plus, Trash2, Globe, GlobeLock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { workflowService } from '../services/workflow.service'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'

interface Workflow {
  id: string
  name: string
  description: string | null
  cityId: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  city: { name: string }
}

export default function WorkflowList() {
  const router = useRouter()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await workflowService.getMyWorkflows()
        if (response.data?.workflows) {
          setWorkflows(response.data.workflows)
        }
      } catch (err) {
        setError('Failed to load workflows')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  const handleDelete = async () => {
    if (!deleteTargetId) return
    setIsDeleting(true)
    try {
      await workflowService.deleteWorkflow(deleteTargetId)
      setWorkflows((prev) => prev.filter((w) => w.id !== deleteTargetId))
    } catch (err) {
      console.error('Failed to delete workflow', err)
    } finally {
      setIsDeleting(false)
      setDeleteTargetId(null)
    }
  }

  const deleteTarget = workflows.find((w) => w.id === deleteTargetId)

  if (loading) {
    return <div className="p-4 text-center">Loading workflows...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={() => router.push('/builder')}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't created any workflows yet.
            </p>
            <Button onClick={() => router.push('/builder')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-medium truncate">
                        {workflow.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          workflow.isPublished
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {workflow.isPublished ? (
                          <Globe className="h-3 w-3" />
                        ) : (
                          <GlobeLock className="h-3 w-3" />
                        )}
                        {workflow.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{workflow.city.name}</span>
                      <span>
                        Updated {format(new Date(workflow.updatedAt), 'PP')}
                      </span>
                    </div>
                    {workflow.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {workflow.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/builder?id=${workflow.id}`)}
                    >
                      Edit
                    </Button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      onClick={() => setDeleteTargetId(workflow.id)}
                      aria-label="Delete workflow"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deleteTarget?.name ?? ''}</strong>?<br />
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
    </>
  )
}
