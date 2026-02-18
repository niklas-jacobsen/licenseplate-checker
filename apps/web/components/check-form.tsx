'use client'

import { useState, useEffect } from 'react'
import { Combobox } from './ui/combobox'
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
import { zLicensePlateScheme } from '@licenseplate-checker/shared/validators'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Input } from './ui/input'
import LicensePlatePreview from './plate-preview'
import { useAuth } from '../lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { checkService } from '../services/check.service'
import { cityService } from '../services/city.service'
import { usePersistedForm } from '../hooks/use-persisted-form'
import { usePlateInput } from '../hooks/use-plate-input'

const formSchema = zLicensePlateScheme

// Local storage key for saved form data
const SAVED_FORM_KEY = 'plateCheck:savedFormData'

export default function LicensePlateCheckForm() {
  const { user } = useAuth()
  const router = useRouter()
  const { formatLetters, formatNumbers } = usePlateInput()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [cities, setCities] = useState<{ value: string; label: string }[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: '',
      letters: '',
      numbers: '',
    },
    mode: 'onTouched',
  })

  // Use custom hook for persistence
  const { saveForm } = usePersistedForm(form, SAVED_FORM_KEY)

  // Fetch Cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await cityService.getCities()
        if (response.data && response.data.cities) {
          const formattedCities = response.data.cities.map((city) => ({
            value: city.id,
            label: city.name,
          }))
          setCities(formattedCities)
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error)
      } finally {
        setIsLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  const city = form.watch('city')
  const letters = form.watch('letters')
  const numbers = form.watch('numbers')

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      // Save data and redirect
      saveForm(values)
      router.push('/auth/login?redirect=/checks?fromLogin=true')
      return
    }

    setAuthError(false)
    setIsSubmitting(true)

    const createLicensePlateCheck = async () => {
      try {
        await checkService.createCheck(values)
        setIsSubmitted(true)
      } catch (error) {
        console.error('Error creating license plate check:', error)
        setAuthError(true)
      } finally {
        setIsSubmitting(false)
      }
    }

    createLicensePlateCheck()
  }

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="city"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">City</FormLabel>
                    <FormControl>
                      <Combobox
                        value={field.value}
                        onChange={field.onChange}
                        error={!!form.formState.errors.city}
                        items={cities}
                        placeholder={
                          isLoadingCities
                            ? 'Loading cities...'
                            : 'Select city...'
                        }
                      />
                    </FormControl>
                    <div className="min-h-5"></div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="letters"
                render={({ field }) => (
                  <FormItem>
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
                    <div className="min-h-5">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numbers"
                render={({ field }) => (
                  <FormItem>
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
                    <div className="min-h-5">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4">
              <LicensePlatePreview
                city={city}
                letters={letters}
                numbers={numbers}
              />
            </div>

            <div className="pt-4 flex justify-center">
              <Button
                type="submit"
                className="w-full md:w-1/2"
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
      </CardContent>
    </Card>
  )
}
