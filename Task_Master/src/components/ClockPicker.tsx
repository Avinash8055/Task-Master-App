import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../styles/themes';
import { format, parse } from 'date-fns';

interface ClockPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const ClockPicker: React.FC<ClockPickerProps> = ({ value, onChange }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState<number>(12);
  const [minutes, setMinutes] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  
  // Initialize the clock with the current value
  useEffect(() => {
    if (value) {
      try {
        // Parse the time string
        let timeDate;
        if (value.includes(':')) {
          // Handle 24-hour format
          const [h, m] = value.split(':').map(Number);
          timeDate = new Date();
          timeDate.setHours(h);
          timeDate.setMinutes(m);
        } else if (value.includes('AM') || value.includes('PM')) {
          // Handle 12-hour format
          timeDate = parse(value, 'h:mm a', new Date());
        } else {
          return;
        }
        
        let h = timeDate.getHours();
        const m = timeDate.getMinutes();
        const p = h >= 12 ? 'PM' : 'AM';
        
        // Convert 24-hour to 12-hour format
        h = h % 12;
        h = h ? h : 12; // Convert 0 to 12
        
        setHours(h);
        setMinutes(m);
        setPeriod(p as 'AM' | 'PM');
      } catch (error) {
        console.error('Error parsing time:', error);
      }
    }
  }, [value]);

  // Update the time when any component changes
  const updateTime = () => {
    let h = hours;
    
    // Convert 12-hour to 24-hour for internal storage
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    
    const timeDate = new Date();
    timeDate.setHours(h);
    timeDate.setMinutes(minutes);
    
    // Format as 12-hour time with AM/PM
    const formattedTime = format(timeDate, 'h:mm a');
    onChange(formattedTime);
    setIsOpen(false);
  };

  // Generate hour numbers for the clock
  const hourNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minute numbers (0, 5, 10, ..., 55)
  const minuteNumbers = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="relative">
      <div 
        className="flex items-center border rounded-md p-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Clock size={18} className="mr-2 text-gray-500" />
        <input
          type="text"
          value={value}
          readOnly
          className="outline-none w-full cursor-pointer"
          placeholder="Select time"
        />
      </div>
      
      {isOpen && (
        <div className={`absolute z-50 mt-2 p-4 ${themes[theme].secondary} rounded-lg shadow-lg w-[280px]`}>
          <div className="mb-4 text-center">
            <div className={`text-xl font-bold ${themes[theme].text}`}>
              {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')} {period}
            </div>
          </div>
          
          {/* Hour selection */}
          <div className="mb-4">
            <div className={`text-sm font-medium mb-2 ${themes[theme].text}`}>Hour</div>
            <div className="grid grid-cols-4 gap-2">
              {hourNumbers.map((hour) => (
                <button
                  key={`hour-${hour}`}
                  className={`p-2 rounded-full ${
                    hours === hour 
                      ? `${themes[theme].primary} text-white` 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setHours(hour)}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
          
          {/* Minute selection */}
          <div className="mb-4">
            <div className={`text-sm font-medium mb-2 ${themes[theme].text}`}>Minute</div>
            <div className="grid grid-cols-4 gap-2">
              {minuteNumbers.map((minute) => (
                <button
                  key={`minute-${minute}`}
                  className={`p-2 rounded-full ${
                    minutes === minute 
                      ? `${themes[theme].primary} text-white` 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setMinutes(minute)}
                >
                  {minute.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
          
          {/* AM/PM selection */}
          <div className="mb-4">
            <div className={`text-sm font-medium mb-2 ${themes[theme].text}`}>AM/PM</div>
            <div className="flex gap-2">
              <button
                className={`flex-1 p-2 rounded-md ${
                  period === 'AM' 
                    ? `${themes[theme].primary} text-white` 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setPeriod('AM')}
              >
                AM
              </button>
              <button
                className={`flex-1 p-2 rounded-md ${
                  period === 'PM' 
                    ? `${themes[theme].primary} text-white` 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setPeriod('PM')}
              >
                PM
              </button>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-md ${themes[theme].primary} text-white`}
              onClick={updateTime}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClockPicker;