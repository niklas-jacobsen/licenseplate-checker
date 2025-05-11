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
import { zRequestScheme } from '@shared/validators'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Input } from './ui/input'
import { Alert, AlertDescription } from './ui/alert'
import LicensePlatePreview from './plate-preview'
import { useAuth } from '../lib/auth-context'
import { useRouter } from 'next/navigation'
import apiClient from '../lib/api-client'
import Link from 'next/link'

// Custom validator for combined wildcard constraints
const validateWildcardConstraints = (data: {
  letters: string
  numbers: string
}) => {
  // Count total ? wildcards in both fields
  const letterWildcards = (data.letters.match(/\?/g) || []).length
  const numberWildcards = (data.numbers.match(/\?/g) || []).length
  const totalWildcards = letterWildcards + numberWildcards

  // Check if both fields have * wildcard
  const bothHaveAsterisk =
    data.letters.includes('*') && data.numbers.includes('*')

  // Check if letters field has ??
  const hasDoubleQuestionMark = data.letters === '??'

  // Check if numbers field has * with other numbers
  const hasAsteriskWithNumbers =
    data.numbers.includes('*') && data.numbers.replace('*', '').length > 0

  if (totalWildcards > 3) {
    return {
      valid: false,
      message: "Maximum 3 '?' wildcards total across both fields.",
    }
  }

  if (bothHaveAsterisk) {
    return {
      valid: false,
      message: "Both fields cannot have '*' simultaneously.",
    }
  }

  if (hasDoubleQuestionMark) {
    return { valid: false, message: "Letters field cannot be '??'." }
  }

  if (hasAsteriskWithNumbers) {
    return {
      valid: false,
      message: "The '*' wildcard in the numbers field can only be used alone.",
    }
  }

  return { valid: true }
}

// German license plate format validation
const formSchema = zRequestScheme.refine(
  (data) => {
    const result = validateWildcardConstraints(data)
    return result.valid
  },
  {
    message: 'Invalid wildcard combination. Check the wildcard rules below.',
  }
)

// Local storage key for saved form data
const SAVED_FORM_KEY = 'plateReserve:savedFormData'

export default function LicensePlateForm() {
  const { user } = useAuth()
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [authError, setAuthError] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [allFieldsValid, setAllFieldsValid] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: '',
      letters: '',
      numbers: '',
    },
    mode: 'onTouched',
  })

  // Load saved form data if returning from login
  useEffect(() => {
    const savedFormData = localStorage.getItem(SAVED_FORM_KEY)
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        form.reset(parsedData)
        // Clear saved data after loading
        localStorage.removeItem(SAVED_FORM_KEY)
      } catch (error) {
        console.error('Error parsing saved form data:', error)
      }
    }
  }, [form])

  const city = form.watch('city')
  const letters = form.watch('letters')
  const numbers = form.watch('numbers')

  // Check wildcard constraints and update validation message
  useEffect(() => {
    const result = validateWildcardConstraints({ letters, numbers })
    if (!result.valid && result.message) {
      setValidationMessage(result.message)
    } else {
      setValidationMessage('')
    }
  }, [letters, numbers])

  // Very messy validation checks but it works for now.
  // Needs to be refactored asap
  useEffect(() => {
    const { isValid } = form.formState

    // Check if all fields are valid and have values
    const allFieldsValid =
      !!city &&
      !form.getFieldState('city').invalid &&
      !!letters &&
      !form.getFieldState('letters').invalid &&
      !!numbers &&
      !form.getFieldState('numbers').invalid &&
      isValid

    setAllFieldsValid(allFieldsValid)
  }, [city, letters, numbers, form.formState.isValid])

  // Check if the plate contains wildcards anywhere
  const hasWildcards = () => {
    return (
      letters?.includes('*') ||
      letters?.includes('?') ||
      numbers?.includes('*') ||
      numbers?.includes('?')
    )
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      // Save form data to localStorage before redirecting
      localStorage.setItem(SAVED_FORM_KEY, JSON.stringify(values))

      // Redirect to login with return URL
      router.push('/auth/login?redirect=/?fromLogin=true')
      return
    }

    setAuthError(false)
    setIsSubmitting(true)

    const createLicensePlateRequest = async () => {
      try {
        const response = await apiClient.post('request/new', values)
        console.log(response)
      } catch (error) {
        console.error('Error creating license plate request:', error)
        setAuthError(true)
      } finally {
        setIsSubmitting(false)
        setIsSubmitted(true)
        console.log(values)
      }
    }

    createLicensePlateRequest()
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
              Your license plate pattern {city}-{letters}-{numbers} has been
              submitted for automatic reservation.
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
                <Link href="/requests" className="w-full">
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
                      />
                    </FormControl>
                    <div className="min-h-[1.25rem]"></div>
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
                        placeholder="AB, X, *..."
                        {...field}
                        className="uppercase"
                        maxLength={2}
                        onChange={(e) => {
                          // Convert to uppercase and filter out invalid characters
                          const value = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z*?]/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <div className="min-h-[1.25rem]">
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
                        placeholder="123, 9?92..."
                        {...field}
                        maxLength={4}
                        onChange={(e) => {
                          // Filter out invalid characters, ensure no leading zeros
                          let value = e.target.value.replace(/[^0-9*?]/g, '')

                          if (
                            value.length > 0 &&
                            value[0] === '0' &&
                            !['*', '?'].includes(value[0])
                          ) {
                            value = value.substring(1)
                          }

                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <div className="min-h-[1.25rem]">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {validationMessage && (
              <Alert className="bg-red-50 text-red-800 border-red-200">
                <AlertDescription>
                  <p className="font-medium">Validation Error:</p>
                  <p>{validationMessage}</p>
                </AlertDescription>
              </Alert>
            )}

            <Alert className="bg-blue-50 text-blue-800 border-blue-200 my-2">
              <AlertDescription>
                <p className="font-medium">How to use</p>
                <ul className="list-disc list-inside text-sm mb-3">
                  <li>Choose your city and enter your desired license plate</li>
                  <li>
                    Use "*" to match any sequence of characters (A-ZZ or 1-9999)
                  </li>
                  <li>Use ? to match exactly one character (A-Z or 1-9)</li>
                </ul>
                <p className="font-medium">Guidelines</p>
                <ul className="list-disc list-inside text-sm">
                  <li>
                    "*" can only be used alone, as it represents all
                    possibilities
                  </li>
                  <li>Both fields cannot have "*" simultaneously</li>
                  <li>
                    Maximum of 3 "?" wildcards total across letters and numbers
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="pt-4">
              <LicensePlatePreview
                city={city}
                letters={letters}
                numbers={numbers}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
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
