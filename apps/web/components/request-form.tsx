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
import { zRequestScheme } from '@licenseplate-checker/shared/validators'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Input } from './ui/input'
import { Alert, AlertDescription } from './ui/alert'

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

export default function LicensePlateForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const city = form.watch('city')
  const letters = form.watch('letters')
  const numbers = form.watch('numbers')

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Form {...form}>
          <div className="space-y-6">
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
          </div>

          <Alert className="bg-blue-50 text-blue-800 border-blue-200 my-2">
            <AlertDescription>
              <p className="font-medium">Wildcards:</p>
              <ul className="list-disc list-inside text-sm mt-1">
                <li>
                  Use * to match any sequence of characters (including none)
                </li>
                <li>Use ? to match exactly one character</li>
                <li>Maximum of 3 "?" wildcards total across both fields</li>
                <li>Both fields cannot have "*" simultaneously</li>
                <li>
                  In the numbers field, "*" can only be used alone (not with
                  other numbers)
                </li>
                <li>
                  All combinations will respect the maximum field lengths (2
                  letters, 4 numbers)
                </li>
              </ul>
            </AlertDescription>
          </Alert>

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
        </Form>
      </CardContent>
    </Card>
  )
}
