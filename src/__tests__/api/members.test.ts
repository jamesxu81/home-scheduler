/**
 * @jest-environment node
 */
import { POST, GET, PUT, DELETE } from '@/app/api/members/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    familyMember: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Members API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/members', () => {
    it('should create a family member', async () => {
      const mockMember = {
        id: 'member-1',
        name: 'Alice',
        age: 10,
        color: '#ff6b6b',
        photo: null,
        familyId: 'family-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.familyMember.create as jest.Mock).mockResolvedValue(mockMember);

      const request = new NextRequest('http://localhost:3000/api/members', {
        method: 'POST',
        body: JSON.stringify({
          familyId: 'family-1',
          name: 'Alice',
          age: 10,
          color: '#ff6b6b',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('member-1');
      expect(data.name).toBe('Alice');
      expect(data.age).toBe(10);
    });

    it('should create a member with optional photo', async () => {
      const mockMember = {
        id: 'member-1',
        name: 'Bob',
        age: 8,
        color: '#4ecdc4',
        photo: 'base64_image_data',
        familyId: 'family-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.familyMember.create as jest.Mock).mockResolvedValue(mockMember);

      const request = new NextRequest('http://localhost:3000/api/members', {
        method: 'POST',
        body: JSON.stringify({
          familyId: 'family-1',
          name: 'Bob',
          age: 8,
          color: '#4ecdc4',
          photo: 'base64_image_data',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.photo).toBe('base64_image_data');
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/members', {
        method: 'POST',
        body: JSON.stringify({
          familyId: 'family-1',
          // Missing name and color
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/members', () => {
    it('should fetch members for a family', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          name: 'Alice',
          age: 10,
          color: '#ff6b6b',
          familyId: 'family-1',
        },
        {
          id: 'member-2',
          name: 'Bob',
          age: 8,
          color: '#4ecdc4',
          familyId: 'family-1',
        },
      ];

      (prisma.familyMember.findMany as jest.Mock).mockResolvedValue(mockMembers);

      const request = new NextRequest('http://localhost:3000/api/members?familyId=family-1', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });

    it('should return 400 if familyId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/members', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/members', () => {
    it('should update a family member', async () => {
      const updatedMember = {
        id: 'member-1',
        name: 'Alice Updated',
        age: 11,
        color: '#ff6b6b',
        photo: null,
        familyId: 'family-1',
      };

      (prisma.familyMember.update as jest.Mock).mockResolvedValue(updatedMember);

      const request = new NextRequest('http://localhost:3000/api/members', {
        method: 'PUT',
        body: JSON.stringify({
          memberId: 'member-1',
          name: 'Alice Updated',
          age: 11,
          color: '#ff6b6b',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Alice Updated');
      expect(data.age).toBe(11);
    });

    it('should update member photo', async () => {
      const updatedMember = {
        id: 'member-1',
        name: 'Alice',
        age: 10,
        color: '#ff6b6b',
        photo: 'new_base64_image_data',
        familyId: 'family-1',
      };

      (prisma.familyMember.update as jest.Mock).mockResolvedValue(updatedMember);

      const request = new NextRequest('http://localhost:3000/api/members', {
        method: 'PUT',
        body: JSON.stringify({
          memberId: 'member-1',
          name: 'Alice',
          age: 10,
          color: '#ff6b6b',
          photo: 'new_base64_image_data',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(data.photo).toBe('new_base64_image_data');
    });

    it('should return 400 if memberId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/members', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Name',
        }),
      });

      const response = await PUT(request);
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/members', () => {
    it('should delete a family member', async () => {
      (prisma.familyMember.delete as jest.Mock).mockResolvedValue({ id: 'member-1' });

      const request = new NextRequest('http://localhost:3000/api/members?memberId=member-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(200);
    });

    it('should return 400 if memberId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/members', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(400);
    });
  });
});
