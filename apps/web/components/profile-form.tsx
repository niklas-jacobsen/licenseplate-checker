'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth-context'
import { zUserUpdateScheme } from '@licenseplate-checker/shared/validators'
import ProfileUpdateModal from '@/components/profile-update-modal'

export default function ProfileForm() {
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const { user, updateUser } = useAuth()

  const form = useForm<z.infer<typeof zUserUpdateScheme>>({
    resolver: zodResolver(zUserUpdateScheme),
    defaultValues: {
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      email: user?.email || '',
      street: user?.street || '',
      streetNumber: user?.streetNumber || '',
      zipCode: user?.zipcode || '',
      city: user?.city || '',
    },
  })

  const [formValues, setFormValues] = useState<z.infer<
    typeof zUserUpdateScheme
  > | null>(null)

  const handleConfirmedSave = async () => {
    if (!formValues) return
    setShowUpdateModal(false)
    setIsSaving(true)

    try {
      await updateUser(formValues)
      setIsSaved(true)
    } catch (error) {
      console.error('Update failed', error)
    } finally {
      setIsSaving(false)
    }
  }

  function onSubmit(values: z.infer<typeof zUserUpdateScheme>) {
    // Show confirmation modal before saving
    setShowUpdateModal(true)

    // Save when the user confirms in the modal
    setFormValues(values)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Editing the information on this page will not affect previously
            created requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john.doe@example.com"
                        type="email"
                        {...field}
                        disabled={!!user?.email}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="streetNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>House Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Berlin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isSaved && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>
                    Your profile has been saved successfully!
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Your personal information is only used for license plate reservations.
        </CardFooter>
      </Card>

      <ProfileUpdateModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  )
}
