
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showLabel?: boolean;
  label?: string;
  valueLabel?: string | number;
  showValue?: boolean;
  marks?: { value: number; label: string }[];
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showLabel, label, valueLabel, showValue, marks, formatValue, ...props }, ref) => {
  const value = Array.isArray(props.value) ? props.value[0] : props.defaultValue ? (Array.isArray(props.defaultValue) ? props.defaultValue[0] : props.defaultValue) : 0;
  
  const formattedValue = formatValue ? formatValue(value as number) : value;
  
  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">{label}</span>
          {showValue && (
            <span className="text-sm font-medium text-anime-primary">
              {valueLabel || formattedValue}
            </span>
          )}
        </div>
      )}
      
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-anime-dark">
          <SliderPrimitive.Range className="absolute h-full bg-anime-primary" />
        </SliderPrimitive.Track>
        
        {marks && marks.map((mark) => (
          <div 
            key={mark.value} 
            className="absolute -translate-x-1/2"
            style={{ 
              left: `${(mark.value - (props.min || 0)) / ((props.max || 100) - (props.min || 0)) * 100}%` 
            }}
          >
            <div className="h-1 w-1 rounded-full bg-gray-500" />
            <div className="mt-1 text-xs text-gray-500">{mark.label}</div>
          </div>
        ))}
        
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-anime-primary bg-background shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
