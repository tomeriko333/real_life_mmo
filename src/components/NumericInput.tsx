import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  isHebrew?: boolean;
}

const NumericInput = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 999, 
  step = 1, 
  placeholder = "0",
  isHebrew = false 
}: NumericInputProps) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const accelerationTimer = useRef<NodeJS.Timeout | null>(null);
  const currentSpeed = useRef(5); // steps per second
  const isPressed = useRef(false);
  const operation = useRef<'plus' | 'minus'>('plus');

  const clampValue = useCallback((val: number) => {
    return Math.max(min, Math.min(max, val));
  }, [min, max]);

  const updateValue = useCallback((newValue: number) => {
    onChange(clampValue(newValue));
  }, [onChange, clampValue]);

  const startLongPress = useCallback((op: 'plus' | 'minus') => {
    operation.current = op;
    isPressed.current = true;
    currentSpeed.current = 5; // Start at 5 steps per second
    setIsLongPressing(true);

    // Initial delay before starting rapid increment
    longPressTimer.current = setTimeout(() => {
      if (!isPressed.current) return;

      const accelerate = () => {
        if (!isPressed.current) return;

        // Perform the operation
        const increment = op === 'plus' ? step : -step;
        updateValue(value + increment);

        // Increase speed gradually up to 20 steps per second
        if (currentSpeed.current < 20) {
          currentSpeed.current = Math.min(20, currentSpeed.current + 0.5);
        }

        // Schedule next operation
        const delay = 1000 / currentSpeed.current;
        accelerationTimer.current = setTimeout(accelerate, delay);
      };

      accelerate();
    }, 500); // 500ms initial delay
  }, [value, step, updateValue]);

  const stopLongPress = useCallback(() => {
    isPressed.current = false;
    setIsLongPressing(false);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    if (accelerationTimer.current) {
      clearTimeout(accelerationTimer.current);
      accelerationTimer.current = null;
    }
  }, []);

  const handleManualInput = (inputValue: string) => {
    const numValue = parseInt(inputValue) || 0;
    updateValue(numValue);
  };

  const handleIncrement = () => {
    updateValue(value + step);
  };

  const handleDecrement = () => {
    updateValue(value - step);
  };

  return (
    <div className={`flex items-center gap-2 ${isHebrew ? 'flex-row-reverse' : ''}`}>
      {/* Minus Button */}
      <Button
        variant="outline"
        size="icon"
        className={`h-8 w-8 ${value <= min ? 'opacity-50' : ''}`}
        disabled={value <= min}
        onClick={handleDecrement}
        onMouseDown={() => startLongPress('minus')}
        onMouseUp={stopLongPress}
        onMouseLeave={stopLongPress}
        onTouchStart={() => startLongPress('minus')}
        onTouchEnd={stopLongPress}
      >
        <Minus className="h-3 w-3" />
      </Button>

      {/* Manual Input */}
      <Input
        type="number"
        value={value}
        onChange={(e) => handleManualInput(e.target.value)}
        placeholder={placeholder}
        className="w-16 text-center"
        min={min}
        max={max}
      />

      {/* Plus Button */}
      <Button
        variant="outline"
        size="icon"
        className={`h-8 w-8 ${value >= max ? 'opacity-50' : ''}`}
        disabled={value >= max}
        onClick={handleIncrement}
        onMouseDown={() => startLongPress('plus')}
        onMouseUp={stopLongPress}
        onMouseLeave={stopLongPress}
        onTouchStart={() => startLongPress('plus')}
        onTouchEnd={stopLongPress}
      >
        <Plus className="h-3 w-3" />
      </Button>

      {/* Visual feedback for long press */}
      {isLongPressing && (
        <div className="text-xs text-muted-foreground animate-pulse">
          {currentSpeed.current.toFixed(0)}/s
        </div>
      )}
    </div>
  );
};

export default NumericInput;