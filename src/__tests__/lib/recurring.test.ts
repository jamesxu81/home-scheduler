import { expandRecurringEvents } from '@/lib/recurring';
import { Event } from '@/types';

describe('Recurring Events Expansion', () => {
  const baseEvent: Event = {
    id: 'event-1',
    title: 'Weekly Event',
    description: 'Test event',
    date: '2026-03-05',
    time: '14:00',
    duration: 30,
    kidId: 'kid-1',
    category: 'activities',
    reminder: false,
    familyId: 'family-1',
  };

  beforeEach(() => {
    // Mock the current date to be 2026-03-01
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-01').getTime());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not expand events with no repeat type', () => {
    const event: Event = { ...baseEvent, repeatType: 'NONE' };
    const expanded = expandRecurringEvents([event]);

    expect(expanded).toHaveLength(1);
    expect(expanded[0].id).toBe('event-1');
    expect(expanded[0].date).toBe('2026-03-05');
  });

  it('should expand daily recurring events', () => {
    const event: Event = {
      ...baseEvent,
      date: '2026-03-05',
      repeatType: 'DAILY',
      repeatUntil: '2026-03-10',
    };

    const expanded = expandRecurringEvents([event]);

    expect(expanded.length).toBeGreaterThan(1);
    expect(expanded.some((e) => e.date === '2026-03-05')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-03-06')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-03-07')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-03-10')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-03-11')).toBe(false);
  });

  it('should expand weekly recurring events', () => {
    const event: Event = {
      ...baseEvent,
      date: '2026-03-05', // Thursday
      repeatType: 'WEEKLY',
      repeatUntil: '2026-03-26',
    };

    const expanded = expandRecurringEvents([event]);

    expect(expanded.some((e) => e.date === '2026-03-05')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-03-12')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-03-19')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-03-26')).toBe(true);
    // Should not include dates that are not Thursdays
    expect(expanded.some((e) => e.date === '2026-03-06')).toBe(false);
  });

  it('should expand weekdays (Mon-Fri) recurring events', () => {
    const event: Event = {
      ...baseEvent,
      date: '2026-03-02', // Monday
      repeatType: 'WEEKDAYS',
      repeatUntil: '2026-03-06',
    };

    const expanded = expandRecurringEvents([event]);

    // Should include Mon-Fri
    expect(expanded.some((e) => e.date === '2026-03-02')).toBe(true); // Mon
    expect(expanded.some((e) => e.date === '2026-03-03')).toBe(true); // Tue
    expect(expanded.some((e) => e.date === '2026-03-04')).toBe(true); // Wed
    expect(expanded.some((e) => e.date === '2026-03-05')).toBe(true); // Thu
    expect(expanded.some((e) => e.date === '2026-03-06')).toBe(true); // Fri

    // Should not include weekend
    expect(expanded.some((e) => e.date === '2026-03-07')).toBe(false); // Sat
    expect(expanded.some((e) => e.date === '2026-03-08')).toBe(false); // Sun
  });

  it('should expand monthly recurring events', () => {
    const event: Event = {
      ...baseEvent,
      date: '2026-03-15',
      repeatType: 'MONTHLY',
      repeatUntil: '2026-06-15',
    };

    const expanded = expandRecurringEvents([event]);

    expect(expanded.some((e) => e.date === '2026-03-15')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-04-15')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-05-15')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-06-15')).toBe(true);
    // Should not include other days of the month
    expect(expanded.some((e) => e.date === '2026-03-16')).toBe(false);
  });

  it('should generate proper expanded event IDs with date suffix', () => {
    const event: Event = {
      ...baseEvent,
      date: '2026-03-05',
      repeatType: 'DAILY',
      repeatUntil: '2026-03-07',
    };

    const expanded = expandRecurringEvents([event]);

    expect(expanded[0].id).toContain('::');
    expect(expanded[0].id).toContain('2026-03-');
  });

  it('should include events before today', () => {
    const event: Event = {
      ...baseEvent,
      date: '2026-02-20',
      repeatType: 'DAILY',
      repeatUntil: '2026-03-10',
    };

    const expanded = expandRecurringEvents([event]);

    // Should include dates before March 1st (today) to show past events
    expect(expanded.some((e) => e.date === '2026-02-20')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-02-21')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-03-01')).toBe(true);
    expect(expanded.some((e) => e.date === '2026-03-10')).toBe(true);
  });

  it('should handle events with no repeatUntil (unlimited recurrence)', () => {
    const event: Event = {
      ...baseEvent,
      date: '2026-03-05',
      repeatType: 'MONTHLY',
      // No repeatUntil
    };

    const expanded = expandRecurringEvents([event]);

    // Should generate events until one year from today
    expect(expanded.some((e) => e.date === '2026-03-05')).toBe(true);
    expect(expanded.some((e) => e.date.startsWith('2027'))).toBe(true);
  });

  it('should preserve event properties in expanded events', () => {
    const event: Event = {
      ...baseEvent,
      title: 'Custom Event',
      description: 'Custom Description',
      category: 'appointment',
      reminder: true,
      date: '2026-03-05',
      repeatType: 'DAILY',
      repeatUntil: '2026-03-07',
    };

    const expanded = expandRecurringEvents([event]);

    expanded.forEach((e) => {
      expect(e.title).toBe('Custom Event');
      expect(e.description).toBe('Custom Description');
      expect(e.category).toBe('appointment');
      expect(e.reminder).toBe(true);
      expect(e.kidId).toBe('kid-1');
      expect(e.familyId).toBe('family-1');
    });
  });

  it('should handle multiple events with different repeat types', () => {
    const event1: Event = {
      ...baseEvent,
      id: 'event-1',
      date: '2026-03-05',
      repeatType: 'DAILY',
      repeatUntil: '2026-03-07',
    };

    const event2: Event = {
      ...baseEvent,
      id: 'event-2',
      date: '2026-03-10',
      repeatType: 'WEEKLY',
      repeatUntil: '2026-04-10',
    };

    const expanded = expandRecurringEvents([event1, event2]);

    const event1Expanded = expanded.filter((e) => e.id.startsWith('event-1::'));
    const event2Expanded = expanded.filter((e) => e.id.startsWith('event-2::'));

    expect(event1Expanded.length).toBeGreaterThan(0);
    expect(event2Expanded.length).toBeGreaterThan(0);
  });
});
