import { eventsAPI, membersAPI } from '@/lib/api';

// Mock fetch
global.fetch = jest.fn();

describe('Events API', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('eventsAPI.add', () => {
    it('should add a new event', async () => {
      const mockResponse = {
        id: 'event-1',
        title: 'Test Event',
        date: '2026-03-05',
        time: '14:00',
        duration: 30,
        kidId: 'kid-1',
        familyId: 'family-1',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await eventsAPI.add('family-1', {
        title: 'Test Event',
        description: '',
        date: '2026-03-05',
        time: '14:00',
        duration: 30,
        kidId: 'kid-1',
        category: 'school',
        reminder: false,
      });

      expect(result.id).toBe('event-1');
      expect(result.title).toBe('Test Event');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/events',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should add an event with recurring fields', async () => {
      const mockResponse = {
        id: 'event-1',
        title: 'Weekly Event',
        date: '2026-03-05',
        time: '14:00',
        duration: 45,
        repeatType: 'WEEKLY',
        repeatUntil: '2026-04-05',
        kidId: 'kid-1',
        familyId: 'family-1',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await eventsAPI.add('family-1', {
        title: 'Weekly Event',
        description: '',
        date: '2026-03-05',
        time: '14:00',
        duration: 45,
        kidId: 'kid-1',
        category: 'school',
        reminder: false,
        repeatType: 'WEEKLY',
        repeatUntil: '2026-04-05',
      });

      expect(result.repeatType).toBe('WEEKLY');
      expect(result.repeatUntil).toBe('2026-04-05');
    });

    it('should throw on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid data' }),
      });

      await expect(
        eventsAPI.add('family-1', {
          title: 'Test Event',
          description: '',
          date: '2026-03-05',
          time: '14:00',
          duration: 30,
          kidId: 'kid-1',
          category: 'school',
          reminder: false,
        })
      ).rejects.toThrow();
    });
  });

  describe('eventsAPI.getAll', () => {
    it('should fetch all events for a family', async () => {
      const mockResponse = [
        { id: 'event-1', title: 'Event 1' },
        { id: 'event-2', title: 'Event 2' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await eventsAPI.getAll('family-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('event-1');
      expect(global.fetch).toHaveBeenCalledWith('/api/events?familyId=family-1');
    });
  });

  describe('eventsAPI.update', () => {
    it('should update an existing event', async () => {
      const mockResponse = {
        id: 'event-1',
        title: 'Updated Event',
        date: '2026-03-10',
        duration: 60,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await eventsAPI.update('event-1', {
        title: 'Updated Event',
        description: '',
        date: '2026-03-10',
        time: '15:00',
        duration: 60,
        kidId: 'kid-1',
        category: 'school',
        reminder: false,
      });

      expect(result.title).toBe('Updated Event');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/events',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('should update recurring event properties', async () => {
      const mockResponse = {
        id: 'event-1',
        title: 'Weekly Event',
        duration: 50,
        repeatType: 'WEEKLY',
        repeatUntil: '2026-04-10',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await eventsAPI.update('event-1', {
        title: 'Weekly Event',
        description: '',
        date: '2026-03-05',
        time: '14:00',
        duration: 50,
        kidId: 'kid-1',
        category: 'school',
        reminder: false,
        repeatType: 'WEEKLY',
        repeatUntil: '2026-04-10',
      });

      expect(result.repeatType).toBe('WEEKLY');
      expect(result.repeatUntil).toBe('2026-04-10');
    });
  });

  describe('eventsAPI.delete', () => {
    it('should delete an event', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await eventsAPI.delete('event-1');

      expect(global.fetch).toHaveBeenCalledWith('/api/events?eventId=event-1', {
        method: 'DELETE',
      });
    });
  });
});

describe('Members API', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('membersAPI.add', () => {
    it('should add a new family member', async () => {
      const mockResponse = {
        id: 'member-1',
        name: 'Alice',
        age: 10,
        color: '#ff6b6b',
        familyId: 'family-1',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await membersAPI.add('family-1', 'Alice', 10, '#ff6b6b');

      expect(result.id).toBe('member-1');
      expect(result.name).toBe('Alice');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/members',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should add a member with optional photo', async () => {
      const mockResponse = {
        id: 'member-1',
        name: 'Bob',
        age: 8,
        color: '#4ecdc4',
        photo: 'base64_encoded_photo',
        familyId: 'family-1',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await membersAPI.add('family-1', 'Bob', 8, '#4ecdc4', 'base64_encoded_photo');

      expect(result.photo).toBe('base64_encoded_photo');
    });
  });

  describe('membersAPI.update', () => {
    it('should update a family member', async () => {
      const mockResponse = {
        id: 'member-1',
        name: 'Alice Updated',
        age: 11,
        color: '#ff6b6b',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await membersAPI.update('member-1', 'Alice Updated', 11, '#ff6b6b');

      expect(result.name).toBe('Alice Updated');
      expect(result.age).toBe(11);
    });
  });

  describe('membersAPI.delete', () => {
    it('should delete a family member', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await membersAPI.delete('member-1');

      expect(global.fetch).toHaveBeenCalledWith('/api/members?memberId=member-1', {
        method: 'DELETE',
      });
    });
  });
});
