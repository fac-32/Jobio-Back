import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import testApp from './__mocks__/mockUserDealbreakerRouter.js';
import supabase from '../config/supabaseClient.js';

const mockSupabaseValue = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: vi.fn(),
};

// Mock the module
vi.mock('../config/supabaseClient.js', () => {
    return {
        default: {
            from: vi.fn(() => mockSupabaseValue),
        },
    };
});

describe('Users Router', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /users_dealbreakers', () => {
        it('should filter by user_id if provided in query params', async () => {
            mockSupabaseValue.select.mockReturnThis();
            mockSupabaseValue.eq.mockResolvedValue({
                data: [{ id: 1, user_id: 99 }],
                error: null,
            });

            const res = await request(testApp).get(
                '/users_dealbreakers?user_id=99',
            );

            expect(res.status).toBe(200);
            expect(supabase.from).toHaveBeenCalledWith('users_dealbreakers');
            expect(mockSupabaseValue.eq).toHaveBeenCalledWith('user_id', '99');
        });

        it('should return all dealbreakers if no user_id is provided', async () => {
            mockSupabaseValue.select.mockResolvedValue({
                data: [],
                error: null,
            });

            await request(testApp).get('/users_dealbreakers');

            // eq should NOT have been called
            expect(mockSupabaseValue.eq).not.toHaveBeenCalled();
        });
    });

    describe('POST /users_dealbreakers', () => {
        it('should create a new dealbreaker record', async () => {
            const payload = { user_id: 1, dealbreakers: 'No remote work' };

            mockSupabaseValue.insert.mockReturnThis();
            mockSupabaseValue.select.mockResolvedValue({
                data: [payload],
                error: null,
            });

            const res = await request(testApp)
                .post('/users_dealbreakers')
                .send(payload);

            expect(res.status).toBe(201);
            expect(mockSupabaseValue.insert).toHaveBeenCalledWith([payload]);
        });
    });

    describe('PUT /users_dealbreakers/:id', () => {
        it('should update a specific record by id', async () => {
            const updatePayload = { dealbreakers: 'Travel required' };

            mockSupabaseValue.update.mockReturnThis();
            mockSupabaseValue.eq.mockReturnThis();
            mockSupabaseValue.select.mockResolvedValue({
                data: [{ id: '5', ...updatePayload }],
                error: null,
            });

            const res = await request(testApp)
                .put('/users_dealbreakers/5')
                .send(updatePayload);

            expect(res.status).toBe(200);
            expect(mockSupabaseValue.update).toHaveBeenCalledWith(
                updatePayload,
            );
            expect(mockSupabaseValue.eq).toHaveBeenCalledWith('id', '5');
        });
    });

    describe('DELETE /users_dealbreakers/:id', () => {
        it('should delete a dealbreaker record successfully', async () => {
            const recordId = '42';
            const mockDeletedData = [
                { id: recordId, user_id: 1, dealbreakers: 'Old Data' },
            ];

            mockSupabaseValue.delete.mockReturnThis();
            mockSupabaseValue.eq.mockReturnThis();
            mockSupabaseValue.select.mockResolvedValue({
                data: mockDeletedData,
                error: null,
            });

            const res = await request(testApp).delete(
                `/users_dealbreakers/${recordId}`,
            );

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockDeletedData);

            expect(supabase.from).toHaveBeenCalledWith('users_dealbreakers');
            expect(mockSupabaseValue.delete).toHaveBeenCalled();
            expect(mockSupabaseValue.eq).toHaveBeenCalledWith('id', recordId);
        });

        it('should return 500 if the database deletion fails', async () => {
            mockSupabaseValue.delete.mockReturnThis();
            mockSupabaseValue.eq.mockReturnThis();
            mockSupabaseValue.select.mockResolvedValue({
                data: null,
                error: { message: 'Foreign key constraint violation' },
            });

            const res = await request(testApp).delete(
                '/users_dealbreakers/999',
            );

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Foreign key constraint violation');
        });
    });
});
