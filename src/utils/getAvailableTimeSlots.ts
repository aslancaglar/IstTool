interface RestaurantHours {
  day: string;
  time: string;
}

interface Holiday {
  startDate: string;
  endDate: string;
  name?: string;
  active: boolean;
}

interface TimeSlot {
  label: string;
  value: string;
}

/**
 * Parses time ranges from the hours string format
 * Supports formats like "11h00 - 15h00" or "11:00 - 15:00"
 * Multi-slot: "11h00 - 15h00 et 18h00 - 22h00"
 */
function parseTimeRanges(timeStr: string): Array<{ start: number; end: number }> {
  if (!timeStr || timeStr.toLowerCase().includes('fermé') || timeStr.toLowerCase().includes('ferme')) {
    return [];
  }

  // Normalize string: replace 'h' with ':'
  const normalized = timeStr.toLowerCase().replace(/h/g, ':');
  
  // Split by 'et', 'and', or comma for multiple time ranges
  const timeRanges = normalized.split(/\s+et\s+|\s+and\s+|,/).map(t => t.trim());
  const ranges: Array<{ start: number; end: number }> = [];

  for (const range of timeRanges) {
    // Parse start and end times - handle formats like "11:00 - 15:00" or "11:00-15:00"
    const match = range.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    
    if (match) {
      const [, startHour, startMin, endHour, endMin] = match;
      const startTime = parseInt(startHour) * 60 + parseInt(startMin);
      let endTime = parseInt(endHour) * 60 + parseInt(endMin);
      
      // Handle midnight crossing (e.g., 17:00 - 00:00 means open until midnight)
      if (endTime === 0) {
        endTime = 24 * 60; // Treat 00:00 as end of day
      }
      
      ranges.push({ start: startTime, end: endTime });
    }
  }

  return ranges;
}

/**
 * Checks if a given date is within a holiday period
 */
function isHoliday(date: Date, holidays: Holiday[]): boolean {
  if (!holidays || holidays.length === 0) return false;

  const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  for (const holiday of holidays) {
    if (!holiday.active) continue;

    const start = new Date(holiday.startDate).getTime();
    const end = new Date(holiday.endDate).getTime();

    if (checkDate >= start && checkDate <= end) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a day string matches the given date
 * Supports formats like "Lundi", "Lundi - Vendredi", "Lundi, Mercredi, Vendredi"
 */
function dayMatches(dayStr: string, date: Date): boolean {
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const dayName = dayNames[date.getDay()];
  const normalizedDayStr = dayStr.toLowerCase().trim();
  
  // Check for single day match
  if (normalizedDayStr === dayName) {
    return true;
  }
  
  // Check for day ranges (e.g., "Lundi - Vendredi", "Lundi-Vendredi")
  const rangeMatch = normalizedDayStr.match(/^(\w+)\s*-\s*(\w+)$/);
  if (rangeMatch) {
    const [, startDay, endDay] = rangeMatch;
    const startIdx = dayNames.indexOf(startDay);
    const endIdx = dayNames.indexOf(endDay);
    const currentIdx = dayNames.indexOf(dayName);
    
    if (startIdx !== -1 && endIdx !== -1) {
      if (startIdx <= endIdx) {
        return currentIdx >= startIdx && currentIdx <= endIdx;
      } else {
        // Handle wrap-around (e.g., "Vendredi - Lundi" for weekend+Monday)
        return currentIdx >= startIdx || currentIdx <= endIdx;
      }
    }
  }
  
  // Check for multiple days (e.g., "Lundi, Mercredi, Vendredi")
  const days = normalizedDayStr.split(/[;,]/).map(d => d.trim());
  if (days.includes(dayName)) {
    return true;
  }
  
  return false;
}

/**
 * Gets opening hours for a specific date
 */
function getHoursForDate(date: Date, hours: RestaurantHours[]): Array<{ start: number; end: number }> | null {
  if (!hours || hours.length === 0) return null;

  for (const hourEntry of hours) {
    if (dayMatches(hourEntry.day, date)) {
      const ranges = parseTimeRanges(hourEntry.time);
      if (ranges.length > 0) {
        return ranges;
      }
    }
  }

  return null;
}

/**
 * Formats a time from minutes to "HH:mm"
 */
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Gets available time slots for ordering
 * Generates slots for today and tomorrow (or configured days ahead)
 * Only returns times within opening hours
 * Respects minimum advance notice
 */
export function getAvailableTimeSlots(
  hours: RestaurantHours[] | undefined,
  holidays: Holiday[] | undefined,
  minimumAdvanceNotice: number = 30,
  maxDaysAhead: number = 1
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Add "ASAP" option
  slots.push({ label: 'Dès que possible', value: 'asap' });
  
  if (!hours || hours.length === 0) {
    return slots;
  }

  // Generate slots for each day
  for (let dayOffset = 0; dayOffset <= maxDaysAhead; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);
    
    // Skip holidays
    if (isHoliday(date, holidays || [])) {
      continue;
    }
    
    // Get opening hours for this day
    const dayHours = getHoursForDate(date, hours);
    if (!dayHours) {
      continue;
    }
    
    // Calculate minimum time for this day
    let minTimeMinutes: number;
    if (dayOffset === 0) {
      // Today: minimum time is current time + advance notice
      minTimeMinutes = currentMinutes + minimumAdvanceNotice;
    } else {
      // Future days: start from opening time
      minTimeMinutes = dayHours[0].start;
    }
    
    // Generate 15-minute intervals for each time range
    for (const range of dayHours) {
      // Round up to next 15-minute interval
      let slotTime = Math.ceil(Math.max(minTimeMinutes, range.start) / 15) * 15;
      
      while (slotTime <= range.end) {
        // Create the slot datetime
        const slotDate = new Date(date);
        slotDate.setHours(Math.floor(slotTime / 60), slotTime % 60, 0, 0);
        
        // Format label based on day
        let dayLabel: string;
        if (dayOffset === 0) {
          dayLabel = "Aujourd'hui";
        } else if (dayOffset === 1) {
          dayLabel = 'Demain';
        } else {
          const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          dayLabel = dayNames[slotDate.getDay()];
        }
        
        const timeLabel = formatTime(slotTime);
        
        slots.push({
          label: `${dayLabel} à ${timeLabel}`,
          value: slotDate.toISOString()
        });
        
        slotTime += 15;
      }
    }
  }
  
  return slots;
}
