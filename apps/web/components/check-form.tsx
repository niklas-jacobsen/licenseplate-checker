'use client'

import { useState, useEffect, useRef } from 'react'
import CityPicker from './city-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { zCheckRequestScheme } from '@licenseplate-checker/shared/validators'
import { useForm } from 'react-hook-form'
import { Loader2, Workflow, AlertTriangle } from 'lucide-react'
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
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import LicensePlatePreview from './plate-preview'
import { useAuth } from '../lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { checkService } from '../services/check.service'
import { workflowService } from '../services/workflow.service'
import { usePersistedForm } from '../hooks/use-persisted-form'

const formSchema = zCheckRequestScheme

const SAVED_FORM_KEY = 'plateCheck:savedFormData'

interface WorkflowOption {
  id: string
  name: string
  description: string | null
}

export default function LicensePlateCheckForm() {
  const { user } = useAuth()
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [workflows, setWorkflows] = useState<WorkflowOption[]>([])
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false)
  const [showNoWorkflowWarning, setShowNoWorkflowWarning] = useState(false)
  const pendingSubmitValues = useRef<z.infer<typeof formSchema> | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: '',
      letters: '',
      numbers: '',
      workflowId: undefined,
    },
    mode: 'onTouched',
  })

  // Use custom hook for persistence
  const { saveForm } = usePersistedForm(form, SAVED_FORM_KEY)

  const city = form.watch('city')
  const letters = form.watch('letters')
  const numbers = form.watch('numbers')

  useEffect(() => {
    if (!city) {
      setWorkflows([])
      form.setValue('workflowId', undefined)
      return
    }

    const fetchWorkflows = async () => {
      setIsLoadingWorkflows(true)
      try {
        const response = await workflowService.getPublishedByCity(city)
        if (response.data?.workflows) {
          setWorkflows(response.data.workflows)
        } else {
          setWorkflows([])
        }
      } catch (error) {
        console.error('Failed to fetch workflows:', error)
        setWorkflows([])
      } finally {
        setIsLoadingWorkflows(false)
      }
    }

    form.setValue('workflowId', undefined)
    fetchWorkflows()
  }, [city, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      // Save data and redirect
      saveForm(values)
      router.push('/auth/login?redirect=/checks?fromLogin=true')
      return
    }

    if (!values.workflowId || values.workflowId === 'none') {
      pendingSubmitValues.current = values
      setShowNoWorkflowWarning(true)
      return
    }

    submitCheck(values)
  }

  function submitCheck(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    const createLicensePlateCheck = async () => {
      try {
        const payload = { ...values }
        if (payload.workflowId === 'none') {
          payload.workflowId = undefined
        }
        await checkService.createCheck(payload)
        setIsSubmitted(true)
      } catch (error) {
        console.error('Error creating license plate check:', error)
      } finally {
        setIsSubmitting(false)
      }
    }

    createLicensePlateCheck()
  }

  function handleConfirmNoWorkflow() {
    setShowNoWorkflowWarning(false)
    if (pendingSubmitValues.current) {
      submitCheck(pendingSubmitValues.current)
      pendingSubmitValues.current = null
    }
  }

  const workflowPlaceholder = !city
    ? 'Select a city first'
    : isLoadingWorkflows
      ? 'Loading workflows...'
      : workflows.length === 0
        ? 'No workflows for this city'
        : 'Submit without automation (No checks will be executed)'

  if (isSubmitted) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title id="checkmarkTitle">Success checkmark</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Request Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Your license plate {city}-{letters}-{numbers} has been submitted
              for automatic reservation.
            </p>

            <LicensePlatePreview
              city={city}
              letters={letters}
              numbers={numbers}
            />

            <div className="mt-8 space-y-4">
              <p className="text-sm text-gray-600">
                Our system will now attempt to automatically reserve these
                plates. You can check the status in your dashboard.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  className=" w-full"
                  onClick={() => setIsSubmitted(false)}
                >
                  Submit Another Request
                </Button>
                <Link href="/checks" className="w-full">
                  <Button variant="outline" className="w-full">
                    View My Requests
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="city"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="relative pb-5">
                    <FormLabel className="flex items-center">City</FormLabel>
                    <FormControl>
                      <CityPicker
                        value={field.value}
                        onChange={field.onChange}
                        error={!!form.formState.errors.city}
                      />
                    </FormControl>
                    <FormMessage className="absolute bottom-0 left-0" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="letters"
                render={({ field }) => (
                  <FormItem className="relative pb-5">
                    <FormLabel className="flex items-center">Letters</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="AB, X..."
                        {...field}
                        className="uppercase"
                        maxLength={2}
                        onChange={(e) => {
                          const value = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z]/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage className="absolute bottom-0 left-0" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numbers"
                render={({ field }) => (
                  <FormItem className="relative pb-5">
                    <FormLabel className="flex items-center">Numbers</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123..."
                        {...field}
                        maxLength={4}
                        onChange={(e) => {
                          // Strict number validation only, no leading zeros
                          let value = e.target.value.replace(/[^0-9]/g, '')

                          if (value.length > 0 && value[0] === '0') {
                            value = value.substring(1)
                          }

                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage className="absolute bottom-0 left-0" />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-2">
              <LicensePlatePreview
                city={city}
                letters={letters}
                numbers={numbers}
              />
            </div>

            <Separator />

            <div className="bg-muted/40 rounded-lg p-4">
              <FormField
                control={form.control}
                name="workflowId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Workflow className="h-4 w-4" />
                      Automation Workflow
                      <span className="text-xs font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FormLabel>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(val) =>
                        field.onChange(val === 'none' ? undefined : val)
                      }
                      disabled={!city || isLoadingWorkflows}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={workflowPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          Submit without automation (No checks will be executed)
                        </SelectItem>
                        {workflows.map((wf) => (
                          <SelectItem key={wf.id} value={wf.id}>
                            {wf.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {city
                        ? 'Workflows become visible after being published'
                        : 'Choose a city to see available automation workflows.'}
                    </p>
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t -mx-6 px-6 pt-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Submit Request
              </Button>
            </div>
          </form>
        </Form>

        <AlertDialog
          open={showNoWorkflowWarning}
          onOpenChange={setShowNoWorkflowWarning}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                No Automation Workflow Selected
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to submit a request without an automation
                workflow. This means no automated checks will be executed for
                this license plate.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <p className="text-sm text-amber-800">
                To enable automatic reservation, go to the{' '}
                <strong>Builder</strong> page to create and publish a workflow
                for this city, then select it here.
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Go Back</AlertDialogCancel>
              <Link href="/workflows">
                <Button variant="outline">Go to Builder</Button>
              </Link>
              <AlertDialogAction onClick={handleConfirmNoWorkflow}>
                Submit Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
