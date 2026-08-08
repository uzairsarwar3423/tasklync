import { useState, useMemo, useCallback } from 'react';
import { useBookingDraftStore } from '../store/bookingDraft.store';

export interface CalendarDayItem {
  dateStr: string; // Format: YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean; // Before today's date
  isSunday: boolean;
  month: number; // 0-indexed (0 = Jan)
  year: number;
}

export function formatYYYYMMDD(year: number, monthZeroIndexed: number, day: number): string {
  const m = String(monthZeroIndexed + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  const daysPerMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysPerMonth[monthZeroIndexed];
}

export function useCalendarMonth(initialDateStr?: string) {
  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth(); // 0..11
  const todayDateNumber = today.getDate();
  const todayStr = useMemo(() => formatYYYYMMDD(todayYear, todayMonth, todayDateNumber), [todayYear, todayMonth, todayDateNumber]);

  // Read selected date from store
  const storeSelectedDate = useBookingDraftStore((s) => s.selectedDate);
  const setSelectedDateInStore = useBookingDraftStore((s) => s.setSelectedDate);

  // Parse initial visible month
  const initialYear = initialDateStr
    ? parseInt(initialDateStr.split('-')[0], 10)
    : storeSelectedDate
    ? parseInt(storeSelectedDate.split('-')[0], 10)
    : todayYear;

  const initialMonth = initialDateStr
    ? parseInt(initialDateStr.split('-')[1], 10) - 1
    : storeSelectedDate
    ? parseInt(storeSelectedDate.split('-')[1], 10) - 1
    : todayMonth;

  const [visibleYear, setVisibleYear] = useState<number>(initialYear);
  const [visibleMonth, setVisibleMonth] = useState<number>(initialMonth);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');

  // Check if we can navigate to previous month (cannot go prior to current month)
  const canGoPrev = useMemo(() => {
    if (visibleYear > todayYear) return true;
    if (visibleYear === todayYear && visibleMonth > todayMonth) return true;
    return false;
  }, [visibleYear, visibleMonth, todayYear, todayMonth]);

  const nextMonth = useCallback(() => {
    setSlideDirection('next');
    if (visibleMonth === 11) {
      setVisibleMonth(0);
      setVisibleYear((y) => y + 1);
    } else {
      setVisibleMonth((m) => m + 1);
    }
  }, [visibleMonth]);

  const prevMonth = useCallback(() => {
    if (!canGoPrev) return;
    setSlideDirection('prev');
    if (visibleMonth === 0) {
      setVisibleMonth(11);
      setVisibleYear((y) => y - 1);
    } else {
      setVisibleMonth((m) => m - 1);
    }
  }, [visibleMonth, canGoPrev]);

  const selectDate = useCallback(
    (dateStr: string) => {
      setSelectedDateInStore(dateStr);
    },
    [setSelectedDateInStore]
  );

  // Generate day items for the grid
  const daysArray = useMemo<CalendarDayItem[]>(() => {
    const days: CalendarDayItem[] = [];

    // 1st day of the visible month
    const firstDayInstance = new Date(visibleYear, visibleMonth, 1);
    const startWeekday = firstDayInstance.getDay(); // 0 = Sun, 1 = Mon ...

    const totalDaysInVisibleMonth = getDaysInMonth(visibleYear, visibleMonth);

    // Previous month padding
    const prevYear = visibleMonth === 0 ? visibleYear - 1 : visibleYear;
    const prevMonthIdx = visibleMonth === 0 ? 11 : visibleMonth - 1;
    const totalDaysInPrevMonth = getDaysInMonth(prevYear, prevMonthIdx);

    for (let i = startWeekday - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i;
      const dateStr = formatYYYYMMDD(prevYear, prevMonthIdx, dayNum);
      const isPast = dateStr < todayStr;
      const isSunday = (startWeekday - 1 - i) % 7 === 0;

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast,
        isSunday,
        month: prevMonthIdx,
        year: prevYear,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= totalDaysInVisibleMonth; dayNum++) {
      const dateStr = formatYYYYMMDD(visibleYear, visibleMonth, dayNum);
      const dayOfWeek = (startWeekday + dayNum - 1) % 7;
      const isPast = dateStr < todayStr;

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isPast,
        isSunday: dayOfWeek === 0,
        month: visibleMonth,
        year: visibleYear,
      });
    }

    // Next month padding to reach a multiple of 7 (35 or 42 cells total)
    const totalCells = days.length <= 35 ? 35 : 42;
    const remainingCells = totalCells - days.length;
    const nextYear = visibleMonth === 11 ? visibleYear + 1 : visibleYear;
    const nextMonthIdx = visibleMonth === 11 ? 0 : visibleMonth + 1;

    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const dateStr = formatYYYYMMDD(nextYear, nextMonthIdx, dayNum);
      const isPast = dateStr < todayStr;
      const dayOfWeek = (days.length) % 7;

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast,
        isSunday: dayOfWeek === 0,
        month: nextMonthIdx,
        year: nextYear,
      });
    }

    return days;
  }, [visibleYear, visibleMonth, todayStr]);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthLabel = `${monthNames[visibleMonth]} ${visibleYear}`;

  return {
    visibleYear,
    visibleMonth,
    monthLabel,
    daysArray,
    selectedDate: storeSelectedDate,
    slideDirection,
    canGoPrev,
    nextMonth,
    prevMonth,
    selectDate,
  };
}
