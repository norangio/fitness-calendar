import type { Activity, ActivityType } from '../types/activity.ts';

const types: { type: ActivityType; title: string; avgDuration: number }[] = [
  { type: 'basketball', title: 'Basketball', avgDuration: 90 },
  { type: 'yoga', title: 'Morning Yoga', avgDuration: 45 },
  { type: 'open_water_swimming', title: 'Ocean Swim', avgDuration: 50 },
  { type: 'weightlifting', title: 'Strength Training', avgDuration: 60 },
  { type: 'running', title: 'Morning Run', avgDuration: 35 },
  { type: 'cycling', title: 'Road Ride', avgDuration: 75 },
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSeedData(): Activity[] {
  const activities: Activity[] = [];
  const now = new Date();
  const year = now.getFullYear();

  // Generate activities for the past 6 months
  for (let monthOffset = -6; monthOffset <= 0; monthOffset++) {
    const month = now.getMonth() + monthOffset;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 3-5 activities per week ≈ 15-22 per month
    const count = randomBetween(15, 22);
    const usedDays = new Set<number>();

    for (let i = 0; i < count; i++) {
      let day: number;
      do {
        day = randomBetween(1, daysInMonth);
      } while (usedDays.has(day) && usedDays.size < daysInMonth);
      usedDays.add(day);

      const template = types[randomBetween(0, types.length - 1)];
      const d = new Date(year, month, day);
      // Don't generate future activities
      if (d > now) continue;

      const durationVariance = randomBetween(-15, 15);
      const hours = [6, 7, 8, 9, 10, 16, 17, 18, 19];
      const hour = hours[randomBetween(0, hours.length - 1)];

      activities.push({
        id: crypto.randomUUID(),
        type: template.type,
        title: template.title,
        date: `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        startTime: `${String(hour).padStart(2, '0')}:${String(randomBetween(0, 59)).padStart(2, '0')}:00`,
        durationMinutes: Math.max(15, template.avgDuration + durationVariance),
        calories: randomBetween(150, 600),
        avgHeartRate: randomBetween(110, 160),
        maxHeartRate: randomBetween(160, 195),
        distanceKm: template.type === 'running' ? randomBetween(3, 12) :
                     template.type === 'cycling' ? randomBetween(15, 60) :
                     template.type === 'open_water_swimming' ? randomBetween(1, 4) : undefined,
        source: 'manual',
      });
    }
  }

  return activities.sort((a, b) => a.date.localeCompare(b.date));
}
