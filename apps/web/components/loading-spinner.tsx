"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-600 border-t-blue-500",
        sizeClasses[size],
        className
      )}
    />
  )
}

interface AiGenerationTraceProps {
  stage?: string
}

export function AiGenerationTrace({ stage = "Analyzing product data..." }: AiGenerationTraceProps) {
  return (
    <div className="flex flex-col items-center space-y-4 p-8">
      <LoadingSpinner size="lg" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          AI Generation in Progress
        </h3>
        <p className="text-gray-300">{stage}</p>
        <div className="mt-4 space-y-2 text-sm text-gray-300">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Parsing ingredients</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
            <span>Calculating nutrition</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
            <span>Generating legal text</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-300"></div>
            <span>Checking compliance</span>
          </div>
        </div>
      </div>
    </div>
  )
}