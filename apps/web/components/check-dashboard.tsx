import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import LicensePlatePreview from './plate-preview'
import { useRouter } from 'next/navigation'
import { checkService } from '../services/check.service'
import { format } from 'date-fns'
import type { LicensePlateCheck } from '@licenseplate-checker/shared/types'
import { Trash2, Search, Loader2, Check, X, Clock } from 'lucide-react'
import { Badge } from './ui/badge'
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
import { toTitleCase } from '@/lib/utils'

const LicensePlateCheckDashboard = () => {
  const router = useRouter()
  const [checks, setChecks] = useState<LicensePlateCheck[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await checkService.getChecks()

        if (response.status === 200 && response.data?.checks) {
          setChecks(response.data.checks || [])
        } else {
          setError('No requests found for this user')
        }
      } catch (err) {
        setError('An error occurred while fetching the requests')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleDelete = async () => {
    if (!deleteTargetId) return
    setIsDeleting(true)
    try {
      await checkService.deleteCheck(deleteTargetId)
      setChecks(checks.filter((c) => c.id !== deleteTargetId))
    } catch (error) {
      console.error('Failed to delete check', error)
    } finally {
      setIsDeleting(false)
      setDeleteTargetId(null)
    }
  }

  const getExecutionBadge = (status: string) => {
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

  const deleteTarget = checks.find((c) => c.id === deleteTargetId)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-700"
          >
            Available
          </Badge>
        )
      case 'RESERVED':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Reserved
          </Badge>
        )
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-600 hover:bg-gray-100 hover:text-gray-600"
          >
            {toTitleCase(status)}
          </Badge>
        )
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )

  if (error)
    return (
      <div className="text-center p-8 text-destructive bg-destructive/10 rounded-lg mx-auto max-w-lg">
        <p>{error}</p>
      </div>
    )

  if (checks.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted/50 p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Requests Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            You haven't submitted any license plate checks yet. Create your
            first request to get started.
          </p>
          <Button onClick={() => router.push('/')}>
            Make Your First Request
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {checks.map((check) => (
          <Card
            key={check.id}
            className="overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors py-0"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    {check.city.name}
                  </span>
                  <span className="font-europlate text-xl tracking-wider">
                    {check.cityId.toUpperCase()} - {check.letters} -{' '}
                    {check.numbers}
                  </span>
                </div>
                {getStatusBadge(check.status)}
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t text-sm">
                {check.workflow && (
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Workflow</span>
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:underline"
                      onClick={() =>
                        router.push(`/workflows/${check.workflow!.id}`)
                      }
                    >
                      <span className="font-medium text-foreground text-xs">
                        {check.workflow.name}
                      </span>
                    </div>
                    {check.executions && check.executions.length > 0 ? (
                      getExecutionBadge(check.executions[0].status)
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No runs
                      </span>
                    )}
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Created</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(check.createdAt), 'PP')}
                  </span>
                </div>
                {check.lastCheckedAt && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Last Checked</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(check.lastCheckedAt), 'PP p')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/30 px-6 py-3 border-t flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-mono">
                ID: {check.id}
              </span>
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
                onClick={() => setDeleteTargetId(check.id)}
                aria-label="Delete request"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the request for{' '}
              <strong>
                {deleteTarget
                  ? `${deleteTarget.cityId}-${deleteTarget.letters}-${deleteTarget.numbers}`
                  : ''}
              </strong>
              ? <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

export default LicensePlateCheckDashboard
