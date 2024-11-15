import { UnixTime } from '@l2beat/shared-pure'
import { unstable_cache as cache } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { getActivityChart } from '~/server/features/scaling/activity/get-activity-chart'
import { ActivityTimeRange } from '~/server/features/scaling/activity/utils/range'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const range = ActivityTimeRange.catch('30d').parse(searchParams.get('range'))
  return getCachedResponse(range)
}

const getCachedResponse = cache(
  async (range: ActivityTimeRange) => {
    const data = await getActivityChart({ type: 'all' }, range)

    const latestActivityData = data.at(-1)

    if (!latestActivityData) {
      return NextResponse.json({
        success: false,
        error: 'Missing data.',
      })
    }

    // Strip ethereum data points
    const projectsDataPoints = data.map(
      ([timestamp, projectsTxCount]) => [timestamp, projectsTxCount] as const,
    )

    return NextResponse.json({
      success: true,
      data: {
        chart: {
          types: ['timestamp', 'count'],
          data: projectsDataPoints,
        },
      },
    })
  },
  ['scaling-activity-route'],
  {
    revalidate: UnixTime.HOUR,
  },
)
