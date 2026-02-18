import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import LicensePlatePreview from './plate-preview'
import { useRouter } from 'next/navigation'
import { checkService } from '../services/check.service'
import { format } from 'date-fns'

interface LicensePlateCheck {
  id: string
  cityId: string
  letters: string
  numbers: number
  userId: string
  status: string
  createdAt: string
  updatedAt: string
  lastCheckedAt?: string
}

const LicensePlateCheckDashboard = () => {
  const router = useRouter()
  const [checks, setChecks] = useState<LicensePlateCheck[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this check?')) return
    try {
      await checkService.deleteCheck(id)
      setChecks(checks.filter((c) => c.id !== id))
    } catch (error) {
      console.error('Failed to delete check', error)
      alert('Failed to delete check')
    }
  }

  if (loading) return <div className="p-4 text-center">Loading checks...</div>

  if (error) return <div className="p-4 text-center text-red-500">{error}</div>

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 pt-6">
        {checks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You don't have any requests yet.</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              Make Your First Request
            </Button>
          </div>
        ) : (
          checks.map((check) => (
            <Card
              key={check.id}
              className="overflow-hidden mb-4"
            >
              <div className="flex flex-col md:flex-row">
                <div className="p-4 md:w-1/3 flex items-center justify-center bg-gray-50">
                  <LicensePlatePreview
                    city={check.cityId}
                    letters={check.letters}
                    numbers={String(check.numbers)}
                  />
                </div>
                <div className="p-4 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-lg font-medium">
                        {check.cityId}-{check.letters}-{check.numbers}
                       </h3>
                       <span className={`px-2 py-1 rounded-full text-xs font-semibold \${
                         check.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                         check.status === 'RESERVED' ? 'bg-blue-100 text-blue-800' :
                         'bg-gray-100 text-gray-800'
                       }`}>
                         {check.status}
                       </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Created: {format(new Date(check.createdAt), 'PPp')}</p>
                      {check.lastCheckedAt && (
                        <p>Last Checked: {format(new Date(check.lastCheckedAt), 'PPp')}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(check.id)}
                    >
                        Delete
                    </Button>
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

export default LicensePlateCheckDashboard
