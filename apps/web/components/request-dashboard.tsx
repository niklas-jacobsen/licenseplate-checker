import React, { Key, useEffect, useState } from 'react'
import apiClient from '../lib/api-client'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import LicensePlatePreview from './plate-preview'
import router from 'next/router'

interface LicensePlateRequest {
  city: string
  letterRequest: string
  numberRequest: string
  userId: string
  checkstatus: string
  createdAt: string
  updatedAt: string
}

interface RequestList {
  requests: LicensePlateRequest[]
}

const LicensePlateRequests = () => {
  const [requests, setRequests] = useState<LicensePlateRequest[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await apiClient.get<RequestList>('/request/me')

        if (response.status === 200 && response.data?.requests) {
          setRequests(response.data.requests || [])
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

  if (loading) return <div>Loading...</div>

  if (error) return <div>{error}</div>

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 pt-6">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You don't have any requests yet.</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              Make Your First Request
            </Button>
          </div>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-4 md:w-1/3 flex items-center justify-center bg-gray-50">
                  <LicensePlatePreview
                    city={request.city}
                    letters={request.letterRequest}
                    numbers={request.numberRequest}
                  />
                </div>
                <div className="p-4 md:w-2/3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        Status: {request.checkstatus}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested on {request.createdAt}
                      </p>
                      <p className="text-sm text-gray-500">
                        Last updated on {request.updatedAt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default LicensePlateRequests
