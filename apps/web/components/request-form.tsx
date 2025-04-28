'use client'

import { useState, useEffect } from 'react'
import { Form } from '@licenseplate-checker/shared/components/ui/form'
import {
  Card,
  CardContent,
} from '@licenseplate-checker/shared/components/ui/card'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { zRequestScheme } from '@licenseplate-checker/shared/validators'
import { useForm } from 'react-hook-form'

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
    path: ['letters'],
  }
)

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

export default function LicensePlateForm() {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Form {...form}>
          <form></form>
        </Form>
      </CardContent>
    </Card>
  )
}
