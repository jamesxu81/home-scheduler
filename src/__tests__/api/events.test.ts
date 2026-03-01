/**
 * @jest-environment node
 */
import { POST, GET, PUT, DELETE } from '@/app/api/events/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Events API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/events', () => {
    it('should create an event with all required fields', async () => {
      const mockEvent = {
        id: 'test-id',
        title: 'Test Event',
        description: 'Test Description',
        date: '2026-03-05',
        time: '14:00',
        category: 'school',
        reminder: false,
        repeatType: 'NONE',
        repeatUntil: null,
        kidId: 'kid-1',
        familyId: 'family-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify({
          familyId: 'family-1',
          title: 'Test Event',
          description: 'Test Description',
          date: '2026-03-05',
          time: '14:00',
          kidId: 'kid-1',
          category: 'school',
          reminder: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('test-id');
      expect(data.title).toBe('Test Event');
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify({
          familyId: 'family-1',
          title: 'Test Event',
          // Missing date, time, kidId
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should handle recurring events with repeatType and repeatUntil', async () => {
      const mockEvent = {
        id: 'recurring-id',
        title: 'Weekly Homework',
        description: '',
        date: '2026-03-05',
        time: '18:00',
        category: 'school',
        reminder: false,
        repeatType: 'WEEKLY',
        repeatUntil: '2026-04-05',
        kidId: 'kid-1',
        familyId: 'family-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify({
          familyId: 'family-1',
          title: 'Weekly Homework',
          date: '2026-03-05',
          time: '18:00',
          kidId: 'kid-1',
          repeatType: 'WEEKLY',
          repeatUntil: '2026-04-05',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.repeatType).toBe('WEEKLY');
      expect(data.repeatUntil).toBe('2026-04-05');
    });
  });

  describe('GET /api/events', () => {
    it('should return all events for a family', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Event 1',
          date: '2026-03-05',
          time: '14:00',
          familyId: 'family-1',
        },
        {
          id: 'event-2',
          title: 'Event 2',
          date: '2026-03-06',
          time: '15:00',
          familyId: 'family-1',
        },
      ];

      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const request = new NextRequest('http://localhost:3000/api/events?familyId=family-1', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
    });

    it('should return 400 if familyId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(400);
    });

    it('should sort events by date and time', async () => {
      (prisma.event.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/events?familyId=family-1', {
        method: 'GET',
      });

      await GET(request);

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ date: 'asc' }, { time: 'asc' }],
        })
      );
    });
  });

  describe('PUT /api/events', () => {
    it('should update an event', async () => {
      const updatedEvent = {
        id: 'event-1',
        title: 'Updated Event',
        date: '2026-03-10',
        time: '15:00',
        repeatType: 'WEEKLY',
        repeatUntil: '2026-04-10',
      };

      (prisma.event.update as jest.Mock).mockResolvedValue(updatedEvent);

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'PUT',
        body: JSON.stringify({
          eventId: 'event-1',
          title: 'Updated Event',
          date: '2026-03-10',
          time: '15:00',
          kidId: 'kid-1',
          category: 'school',
          repeatType: 'WEEKLY',
          repeatUntil: '2026-04-10',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Updated Event');
      expect(data.repeatType).toBe('WEEKLY');
    });

    it('should return 400 if eventId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Event',
        }),
      });

      const response = await PUT(request);
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/events', () => {
    it('should delete an event', async () => {
      (prisma.event.delete as jest.Mock).mockResolvedValue({ id: 'event-1' });

      const request = new NextRequest('http://localhost:3000/api/events?eventId=event-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(200);
    });

    it('should return 400 if eventId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(400);
    });
  });
});
