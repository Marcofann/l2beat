import { ProjectId } from '@l2beat/shared-pure'
import { getDb } from '~/server/database'

import { UnixTime } from '@l2beat/shared-pure'
import { unstable_cache as cache } from 'next/cache'
import { env } from '~/env'

export function getSummedActivityForProject(
  projectId: string,
  range: [UnixTime, UnixTime],
) {
  if (env.MOCK) {
    return 10000
  }

  return getCachedSummedActivityForProject(projectId, range)
}

const getCachedSummedActivityForProject = cache(
  async (projectId: string, range: [UnixTime, UnixTime]) => {
    const db = getDb()
    return db.activity.getSummedUopsCountForProjectAndTimeRange(
      ProjectId(projectId),
      range,
    )
  },
  ['summed-activity-for-project'],
  { tags: ['hourly-data'], revalidate: UnixTime.HOUR },
)
