"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface LifeDotsProps {
  weeksLived: number
  weeksRemaining: number
  totalWeeks: number
}

function buildDotWithTooltip(index: number, props: {
  isLived: boolean
  scale: number
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}) {
  return (
    <TooltipProvider key={index}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "aspect-square rounded-full cursor-pointer mx-auto my-auto w-1.5 h-1.5",
              props.isLived
                ? "bg-gradient-to-br from-black to-gray-300"
                : "bg-gradient-to-br from-gray-100 to-gray-300"
            )}
            animate={{
              scale: props.scale,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
            onClick={props.onClick}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="font-semibold">Week {index + 1}</p>
            <p className="text-muted-foreground">
              Year {Math.floor(index / 52) + 1}, Week {(index % 52) + 1}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export const LifeDots: React.FC<LifeDotsProps> = ({ weeksLived, weeksRemaining, totalWeeks }) => {
  const [hoveredDot, setHoveredDot] = useState<number | null>(null)

  const handleDotClick = (index: number) => {
    console.log(`Clicked dot ${index}`)
    // Add your click handling logic here
  }

  const getScaleValue = (index: number) => {
    if (hoveredDot === null) return 1

    const weekDiff = index % 52 - hoveredDot % 52
    const yearDiff = Math.floor(index / 52) - Math.floor(hoveredDot / 52)
    const distance = Math.sqrt(weekDiff * weekDiff + yearDiff * yearDiff)

    return 1 + Math.exp(-distance / 5) * 0.5
  }

  return (
    <div className="grid auto-rows-fr gap-0.5" style={{ 
      gridTemplateColumns: 'repeat(52, minmax(0, 1fr))',
      width: '100%',
      aspectRatio: '52/90'
    }}>
      {Array.from({ length: totalWeeks }).map((_, index) => 
        buildDotWithTooltip(index, {
          isLived: index < weeksLived,
          scale: getScaleValue(index),
          onMouseEnter: () => setHoveredDot(index),
          onMouseLeave: () => setHoveredDot(null),
          onClick: () => handleDotClick(index),
        })
      )}
    </div>
  )
}

