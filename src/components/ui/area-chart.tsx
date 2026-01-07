"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

interface DataPoint {
  [key: string]: string | number
}

interface AreaChartProps {
  data: DataPoint[]
  index: string
  categories: string[]
  colors?: string[]
  className?: string
  showLegend?: boolean
  showYAxis?: boolean
  showXAxis?: boolean
  showGrid?: boolean
  startEndOnly?: boolean
  valueFormatter?: (value: number) => string
  tooltipCallback?: (props: TooltipProps) => React.ReactNode
}

export function AreaChart({
  data,
  index,
  categories,
  colors = ["#5500FF", "#9D96FF"],
  className,
  showLegend = true,
  showYAxis = true,
  showXAxis = true,
  showGrid = true,
  startEndOnly = false,
  valueFormatter = (v) => v.toString(),
  tooltipCallback,
}: AreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  
  // Calculate bounds
  const allValues = data.flatMap(d => categories.map(c => Number(d[c]) || 0))
  const maxValue = Math.max(...allValues) * 1.1
  const minValue = Math.min(0, ...allValues)
  
  const width = 100
  const height = 50
  const padding = { top: 5, right: 5, bottom: 20, left: showYAxis ? 40 : 5 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  
  // Generate path for each category
  const generatePath = (category: string) => {
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth
      const value = Number(d[category]) || 0
      const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight
      return `${x},${y}`
    })
    return `M${points.join(' L')}`
  }
  
  // Generate area path
  const generateAreaPath = (category: string) => {
    const linePath = generatePath(category)
    const firstX = padding.left
    const lastX = padding.left + chartWidth
    const baseline = padding.top + chartHeight
    return `${linePath} L${lastX},${baseline} L${firstX},${baseline} Z`
  }
  
  // X-axis labels
  const xLabels = startEndOnly 
    ? [data[0]?.[index], data[data.length - 1]?.[index]]
    : data.map(d => d[index])
  
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
        onMouseLeave={() => {
          setHoveredIndex(null)
          tooltipCallback?.({ active: false })
        }}
      >
        <defs>
          {categories.map((category, i) => (
            <linearGradient
              key={category}
              id={`gradient-${category}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        
        {/* Grid lines */}
        {showGrid && (
          <g className="text-gray-200">
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
              <line
                key={i}
                x1={padding.left}
                y1={padding.top + chartHeight * (1 - pct)}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight * (1 - pct)}
                stroke="currentColor"
                strokeWidth={0.2}
                strokeDasharray="1,1"
              />
            ))}
          </g>
        )}
        
        {/* Areas */}
        {categories.map((category, i) => (
          <path
            key={`area-${category}`}
            d={generateAreaPath(category)}
            fill={`url(#gradient-${category})`}
            className="transition-opacity duration-200"
          />
        ))}
        
        {/* Lines */}
        {categories.map((category, i) => (
          <path
            key={`line-${category}`}
            d={generatePath(category)}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth={0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-200"
          />
        ))}
        
        {/* Hover zones */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1)) * chartWidth
          const zoneWidth = chartWidth / (data.length - 1)
          return (
            <rect
              key={i}
              x={x - zoneWidth / 2}
              y={padding.top}
              width={zoneWidth}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => {
                setHoveredIndex(i)
                tooltipCallback?.({
                  active: true,
                  label: String(d[index]),
                  payload: categories.map((c, ci) => ({
                    value: Number(d[c]) || 0,
                    name: c,
                    color: colors[ci % colors.length],
                  })),
                })
              }}
            />
          )
        })}
        
        {/* Hover indicator */}
        {hoveredIndex !== null && (
          <g>
            <line
              x1={padding.left + (hoveredIndex / (data.length - 1)) * chartWidth}
              y1={padding.top}
              x2={padding.left + (hoveredIndex / (data.length - 1)) * chartWidth}
              y2={padding.top + chartHeight}
              stroke="#5500FF"
              strokeWidth={0.3}
              strokeDasharray="1,1"
            />
            {categories.map((category, i) => {
              const x = padding.left + (hoveredIndex / (data.length - 1)) * chartWidth
              const value = Number(data[hoveredIndex][category]) || 0
              const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight
              return (
                <circle
                  key={category}
                  cx={x}
                  cy={y}
                  r={1}
                  fill={colors[i % colors.length]}
                  stroke="white"
                  strokeWidth={0.3}
                />
              )
            })}
          </g>
        )}
        
        {/* X-axis labels */}
        {showXAxis && (
          <g className="text-gray-500" fontSize={2.5}>
            {startEndOnly ? (
              <>
                <text x={padding.left} y={height - 2} textAnchor="start" fill="currentColor">
                  {String(xLabels[0])}
                </text>
                <text x={padding.left + chartWidth} y={height - 2} textAnchor="end" fill="currentColor">
                  {String(xLabels[1])}
                </text>
              </>
            ) : (
              data.map((d, i) => {
                if (i % Math.ceil(data.length / 6) !== 0) return null
                const x = padding.left + (i / (data.length - 1)) * chartWidth
                return (
                  <text key={i} x={x} y={height - 2} textAnchor="middle" fill="currentColor">
                    {String(d[index])}
                  </text>
                )
              })
            )}
          </g>
        )}
        
        {/* Y-axis labels */}
        {showYAxis && (
          <g className="text-gray-500" fontSize={2.5}>
            {[0, 0.5, 1].map((pct, i) => {
              const value = minValue + (maxValue - minValue) * pct
              const y = padding.top + chartHeight * (1 - pct)
              return (
                <text key={i} x={padding.left - 2} y={y + 1} textAnchor="end" fill="currentColor">
                  {valueFormatter(Math.round(value))}
                </text>
              )
            })}
          </g>
        )}
      </svg>
      
      {/* Legend */}
      {showLegend && categories.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-3">
          {categories.map((category, i) => (
            <div key={category} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-xs text-gray-600 capitalize">{category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
