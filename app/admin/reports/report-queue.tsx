'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/user-avatar'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { Check, X, Eye } from 'lucide-react'

interface ReportQueueProps {
  reports: any[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  reviewed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
  dismissed: 'bg-muted text-muted-foreground',
}

export function ReportQueue({ reports }: ReportQueueProps) {
  const router = useRouter()

  async function updateReportStatus(reportId: string, status: string) {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('reports')
      .update({
        status,
        reviewed_by: user?.id,
        resolved_at: ['resolved', 'dismissed'].includes(status)
          ? new Date().toISOString()
          : null,
      })
      .eq('id', reportId)

    if (error) toast.error(error.message)
    else {
      toast.success(`Report ${status}`)
      router.refresh()
    }
  }

  const pendingReports = reports.filter((r) => r.status === 'pending')
  const otherReports = reports.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-8">
      {/* Pending */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Pending ({pendingReports.length})
        </h2>
        {pendingReports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending reports. All clear!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      src={report.reporter?.avatar_url}
                      name={report.reporter?.display_name ?? 'User'}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{report.reporter?.display_name}</span>
                        {' reported a '}
                        <span className="font-medium capitalize">{report.resource_type}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reason: <span className="capitalize">{report.reason}</span>
                        {report.details && ` — ${report.details}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateReportStatus(report.id, 'reviewed')}
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateReportStatus(report.id, 'resolved')}
                    >
                      <Check className="h-4 w-4" />
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateReportStatus(report.id, 'dismissed')}
                    >
                      <X className="h-4 w-4" />
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolved */}
      {otherReports.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">History</h2>
          <div className="space-y-2">
            {otherReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div>
                  <span className="capitalize font-medium">{report.resource_type}</span>
                  <span className="text-muted-foreground"> — {report.reason}</span>
                </div>
                <Badge variant="outline" className={statusColors[report.status]}>
                  {report.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
