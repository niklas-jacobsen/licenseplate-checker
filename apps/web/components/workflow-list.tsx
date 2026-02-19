'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { format } from 'date-fns'
import {
  Plus,
  Trash2,
  Globe,
  GlobeLock,
  Loader2,
  Workflow as WorkflowIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { workflowService } from '../services/workflow.service'
import { cityService } from '../services/city.service'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { BUILDER_REGISTRY_VERSION } from '@licenseplate-checker/shared/node-registry'
import { WORKFLOW_NAME_MAX_LENGTH } from '@licenseplate-checker/shared/constants/limits'
import type { WorkflowNode } from '@licenseplate-checker/shared/workflow-dsl/types'

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

interface City {
  id: string
  name: string
}

const defaultNodes: WorkflowNode[] = [
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

export default function WorkflowList() {
  const router = useRouter()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Creation state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCityId, setNewCityId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        const [workflowsRes, citiesRes] = await Promise.all([
          workflowService.getMyWorkflows(controller.signal),
          cityService.getCities(controller.signal),
        ])

        if (controller.signal.aborted) return
        if (workflowsRes.data?.workflows) {
          setWorkflows(workflowsRes.data.workflows)
        }
        if (citiesRes.data?.cities) {
          setCities(citiesRes.data.cities)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('Failed to load data')
          console.error(err)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
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

  const handleCreate = async () => {
    if (!newName || !newCityId) {
      setCreateError('Name and City are required')
      return
    }
    setIsCreating(true)
    setCreateError('')

    try {
      const definition = {
        registryVersion: BUILDER_REGISTRY_VERSION,
        nodes: defaultNodes,
        edges: [
          {
            id: 'start-end',
            source: 'start',
            target: 'end',
            sourceHandle: 'next',
            targetHandle: 'in',
            type: 'smoothstep',
          },
        ],
      }

      const response = await workflowService.create({
        name: newName,
        cityId: newCityId,
        definition,
      })

      if (response.data?.workflow) {
        setIsCreateOpen(false)
        router.push(`/builder?id=${response.data.workflow.id}`)
      }
    } catch (err) {
      console.error('Failed to create workflow', err)
      setCreateError('Failed to create workflow')
      setIsCreating(false)
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
      {workflows.length > 0 && (
        <div className="flex justify-end mb-6">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      )}

      {workflows.length === 0 ? (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <WorkflowIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Workflows Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You haven't created any workflows yet. Create your first workflow
              to get started.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="flex flex-col h-[180px] py-0 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => router.push(`/workflows/${workflow.id}`)}
            >
              <CardContent className="py-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
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
                  </span>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTargetId(workflow.id)
                    }}
                    aria-label="Delete workflow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-medium truncate mb-1">
                    {workflow.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>
                      {workflow.city.name.length > 22
                        ? `${workflow.city.name.substring(0, 22)}…`
                        : workflow.city.name}
                    </span>
                    <span>•</span>
                    <span>{format(new Date(workflow.updatedAt), 'PP')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {workflow.description || (
                      <span className="italic opacity-50">
                        No description provided
                      </span>
                    )}
                  </p>
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Start by naming your workflow and selecting the city it applies
              to.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Daily Check"
                maxLength={WORKFLOW_NAME_MAX_LENGTH}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <div className="col-span-3">
                <Select value={newCityId} onValueChange={setNewCityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name} ({city.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {createError && (
              <div className="text-sm text-destructive text-center">
                {createError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
