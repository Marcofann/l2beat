import type { ProjectScalingStage } from '@l2beat/config'

import {
  StageBadge,
  getStageTextClassname,
} from '~/components/badge/stage-badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/core/tooltip/tooltip'
import { CircleQuestionMarkIcon } from '~/icons/circle-question-mark'
import { StopwatchIcon } from '~/icons/stopwatch'
import { cn } from '~/utils/cn'
import { StageTooltip } from './stage-tooltip'

export interface StageCellProps {
  stageConfig: ProjectScalingStage
  isAppchain: boolean
}

export function StageCell({ stageConfig, isAppchain }: StageCellProps) {
  const hasNotice =
    stageConfig.stage !== 'UnderReview' &&
    stageConfig.stage !== 'NotApplicable' &&
    !!stageConfig.additionalConsiderations

  return (
    <Tooltip>
      <TooltipTrigger className="flex gap-1" disabledOnMobile>
        <StageBadge
          stage={stageConfig.stage}
          isAppchain={isAppchain}
          className="flex flex-col gap-px"
        />
        {hasNotice && (
          <CircleQuestionMarkIcon
            className={cn(
              '-mt-px size-5 fill-current md:mt-px',
              getStageTextClassname(stageConfig.stage),
            )}
          />
        )}
        {stageConfig.stage !== 'NotApplicable' &&
          stageConfig.stage !== 'UnderReview' &&
          stageConfig.downgradePending && (
            <StopwatchIcon className="mt-px md:mt-[3px]" />
          )}
      </TooltipTrigger>
      <TooltipContent className="max-w-[360px]">
        <StageTooltip stageConfig={stageConfig} isAppchain={isAppchain} />
      </TooltipContent>
    </Tooltip>
  )
}
