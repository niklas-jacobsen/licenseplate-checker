'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InfoIcon } from 'lucide-react'

interface ProfileUpdateModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ProfileUpdateModal({
  open,
  onClose,
  onConfirm,
}: ProfileUpdateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5 text-blue-500" />
            Important Information
          </DialogTitle>
          <DialogDescription>
            Please review before updating your profile
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-700 mb-4">
            Your updated information will be used for all
            <strong> future</strong> license plate reservation requests.
          </p>

          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <p className="text-sm text-amber-800 font-medium mb-2">
              Important Note:
            </p>
            <p className="text-sm text-amber-700">
              These changes will <strong>not</strong> affect any previously
              submitted requests. Previously submitted requests will continue to
              use the information that was provided at the time they were
              created.
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
