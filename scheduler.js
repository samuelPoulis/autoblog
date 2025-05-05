// weekdayScheduler.js
/**
 * Get the first `count` weekday (Mon–Fri) dates in a given month.
 * @param {number} year   – four-digit year
 * @param {number} month  – 1-12 (1 = January)
 * @param {number} count  – how many dates you need
 * @returns {string[]}    – ISO strings YYYY-MM-DD
 */
export function getWeekdayDates(year, month, count) {
    validate(year, month, count);
  
    const dates = [];
    const lastDay = new Date(year, month, 0).getDate();  // last day (#) of month
  
    for (let day = 1; day <= lastDay && dates.length < count; ++day) {
      const d = new Date(year, month - 1, day);          // JS months are 0-indexed
      if (isWeekday(d)) dates.push(toISO(d));
    }
  
    if (dates.length < count) {
      throw new RangeError(
        `Month ${month}/${year} only has ${dates.length} weekdays (need ${count}).`
      );
    }
    return dates;
  }
  
  /**
   * Evenly distribute `count` weekday dates across the month.
   * Tries to give each work-week ⌈count / weeks⌉ or ⌊…⌋ slots.
   * @param {number} year   – four-digit year
   * @param {number} month  – 1-12
   * @param {number} count  – how many dates you need
   * @returns {string[]}    – ISO strings YYYY-MM-DD
   */
  export function getDistributedWeekdayDates(year, month, count) {
    validate(year, month, count);
  
    // 1. Collect all weekdays in the month, grouped by work-week index
    const weeks = [];   // weeks[i] = array of Date objects for that week
    const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0 Sun…6 Sat
    const lastDay = new Date(year, month, 0).getDate();
  
    for (let day = 1; day <= lastDay; ++day) {
      const d = new Date(year, month - 1, day);
      if (!isWeekday(d)) continue;
      const weekIdx = Math.floor((day + firstWeekday) / 7);
      (weeks[weekIdx] ??= []).push(d);
    }
  
    const numWeeks = weeks.length;
    const totalWeekdays = weeks.reduce((n, w) => n + w.length, 0);
    if (count > totalWeekdays) {
      throw new RangeError(
        `Month ${month}/${year} has only ${totalWeekdays} weekdays (need ${count}).`
      );
    }
  
    // 2. Decide how many dates each week gets (distribute the remainder to early weeks)
    const base = Math.floor(count / numWeeks);
    let extra = count % numWeeks;
  
    const chosen = [];
    for (const week of weeks) {
      let need = base + (extra > 0 ? 1 : 0);
      if (extra) extra--;
  
      // pick `need` dates spaced through the current week
      const step = week.length / need;
      for (let i = 0; i < need; i++) {
        const idx = Math.min(Math.round(i * step), week.length - 1);
        chosen.push(week[idx]);
      }
    }
  
    // 3. Sort chronologically and return ISO strings
    return chosen
      .sort((a, b) => a - b)
      .map(toISO);
  }
  
  /* ---------- helpers ---------- */
  function isWeekday(date) {
    const d = date.getDay(); // 0 Sun … 6 Sat
    return d !== 0 && d !== 6;
  }
  function toISO(date) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  function validate(year, month, count) {
    if (!Number.isInteger(year) || year < 1) throw new RangeError('invalid year');
    if (month < 1 || month > 12)            throw new RangeError('month 1-12');
    if (!Number.isInteger(count) || count < 1)
      throw new RangeError('count must be ≥ 1');
  }
  console.log(getDistributedWeekdayDates(2025, 5, 8))