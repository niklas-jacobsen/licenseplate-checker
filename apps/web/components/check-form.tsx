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
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { zCheckRequestScheme } from '@licenseplate-checker/shared/validators'
import { useForm } from 'react-hook-form'
import {
  AlertTriangle,
  Ban,
  Check,
  Loader2,
  type LucideIcon,
  Workflow,
} from 'lucide-react'
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
import LicensePlatePreview from './plate-preview'
import { useAuth } from './auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { checkService } from '../services/check.service'
import { cityService, type City } from '../services/city.service'
import { workflowService } from '../services/workflow.service'
import { usePersistedForm } from '../hooks/use-persisted-form'

const formSchema = zCheckRequestScheme

const SAVED_FORM_KEY = 'plateCheck:savedFormData'

// value of the "No automation" radio; never sent to the API
const NO_AUTOMATION = 'none'

interface WorkflowOption {
  id: string
  name: string
  description: string | null
}

function StepHeading({
  step,
  title,
  description,
  done,
}: {
  step: number
  title: string
  description: string
  done: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
          done ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : step}
      </span>
      <div>
        <h2 className="text-[15px] font-semibold leading-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function WorkflowCard({
  name,
  description,
  value,
  checked,
  onSelect,
  icon: Icon = Workflow,
  muted = false,
}: {
  name: string
  description: string | null
  value: string
  checked: boolean
  onSelect: (value: string) => void
  icon?: LucideIcon
  muted?: boolean
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg border p-3.5 transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
        checked
          ? 'border-neutral-900 ring-1 ring-neutral-900'
          : 'hover:border-neutral-300',
        muted ? 'bg-neutral-50' : 'bg-white'
      )}
    >
      <input
        type="radio"
        name="workflow"
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px]',
          checked ? 'border-neutral-900' : 'border-neutral-300'
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-neutral-900" />}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            muted && 'text-neutral-600'
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {name}
        </span>
        {description && (
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-t border-neutral-100 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

export default function LicensePlateCheckForm() {
  const { user } = useAuth()
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const [workflows, setWorkflows] = useState<WorkflowOption[]>([])
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false)
  const [noAutomation, setNoAutomation] = useState(false)
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
  const workflowId = form.watch('workflowId')

  const cityName = cities.find((c) => c.id === city)?.name
  const selectedWorkflow = workflows.find((wf) => wf.id === workflowId)
  const { errors } = form.formState
  const plateDone =
    !!city &&
    letters.length > 0 &&
    numbers.length > 0 &&
    !errors.city &&
    !errors.letters &&
    !errors.numbers
  const automationDone = !!selectedWorkflow || noAutomation

  useEffect(() => {
    const controller = new AbortController()
    cityService
      .getCities(controller.signal)
      .then((res) => {
        if (res.data?.cities) setCities(res.data.cities)
      })
      .catch(() => {
        /* the picker shows an empty list */
      })
      .finally(() => setIsLoadingCities(false))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    setNoAutomation(false)
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

  function selectAutomation(value: string) {
    const none = value === NO_AUTOMATION
    setNoAutomation(none)
    form.setValue('workflowId', none ? undefined : value, { shouldDirty: true })
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      // Save data and redirect
      saveForm(values)
      router.push('/auth/login?redirect=/checks/new')
      return
    }

    // choosing "No automation" is explicit; only warn when nothing was picked
    if (!values.workflowId && !noAutomation) {
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
        await checkService.createCheck(values)
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

  function resetForAnother() {
    setIsSubmitted(false)
    setNoAutomation(false)
    form.setValue('workflowId', undefined)
  }

  const automationDescription = !city
    ? 'Choose a city first'
    : `Workflows published for ${cityName ?? city}`

  if (isSubmitted) {
    return (
      <Card className="mx-auto w-full max-w-xl">
        <CardContent className="pt-6 text-center">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h2 className="mb-2 text-xl font-bold">Request created</h2>
          <p className="mb-6 text-muted-foreground">
            {selectedWorkflow
              ? `${city}-${letters} ${numbers} will be checked once a day with "${selectedWorkflow.name}".`
              : `${city}-${letters} ${numbers} is saved. No checks will run until you add a workflow.`}
          </p>

          <LicensePlatePreview city={city} letters={letters} numbers={numbers} />

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={resetForAnother}>
              Create another
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/checks">View my requests</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_330px]"
        >
          <Card className="gap-0 overflow-hidden py-0">
            <section className="p-6">
              <StepHeading
                step={1}
                title="Plate"
                description="City code, letters and numbers"
                done={plateDone}
              />
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
                <FormField
                  name="city"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="relative col-span-2 pb-5 sm:col-span-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <CityPicker
                          value={field.value}
                          onChange={field.onChange}
                          error={!!errors.city}
                          cities={cities}
                          loading={isLoadingCities}
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
                      <FormLabel>Letters</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="AB"
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
                      <FormLabel>Numbers</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123"
                          inputMode="numeric"
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
            </section>

            <section className="border-t p-6">
              <StepHeading
                step={2}
                title="Automation"
                description={automationDescription}
                done={automationDone}
              />
              <fieldset className="mt-5" disabled={!city || isLoadingWorkflows}>
                <legend className="sr-only">Automation workflow</legend>
                {!city ? (
                  <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Once you've picked a city, its published workflows show up
                    here.
                  </p>
                ) : isLoadingWorkflows ? (
                  <p className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading workflows…
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {workflows.length === 0 && (
                      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        No workflows have been published for{' '}
                        {cityName ?? city} yet.
                      </p>
                    )}
                    {workflows.map((wf) => (
                      <WorkflowCard
                        key={wf.id}
                        name={wf.name}
                        description={wf.description}
                        value={wf.id}
                        checked={workflowId === wf.id}
                        onSelect={selectAutomation}
                      />
                    ))}
                    <WorkflowCard
                      name="No automation"
                      description="The request is saved, but nothing runs"
                      value={NO_AUTOMATION}
                      checked={noAutomation}
                      onSelect={selectAutomation}
                      icon={Ban}
                      muted
                    />
                  </div>
                )}
              </fieldset>
              <p className="mt-3 text-sm text-muted-foreground">
                Missing your city's site?{' '}
                <Link href="/workflows" className="text-blue-600 hover:underline">
                  Build a workflow
                </Link>{' '}
                and publish it.
              </p>
            </section>
          </Card>

          <Card className="gap-0 p-5 lg:sticky lg:top-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Summary
            </h2>
            <div className="pt-5">
              <LicensePlatePreview
                city={city}
                letters={letters}
                numbers={numbers}
                compact
              />
            </div>
            <dl>
              <SummaryRow label="City" value={cityName ?? (city || '—')} />
              <SummaryRow
                label="Workflow"
                value={
                  selectedWorkflow?.name ??
                  (noAutomation ? 'No automation' : '—')
                }
              />
              <SummaryRow
                label="Schedule"
                value={
                  selectedWorkflow ? 'Once a day, random time' : "Doesn't run"
                }
              />
              <SummaryRow label="Results" value="Under Requests" />
            </dl>
            <Button
              type="submit"
              className="mt-4 w-full"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create request
            </Button>
          </Card>
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
              You are about to submit a request without an automation workflow.
              This means no automated checks will be executed for this license
              plate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              To enable automatic reservation, go to the{' '}
              <strong>Builder</strong> page to create and publish a workflow for
              this city, then select it here.
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
    </>
  )
}
