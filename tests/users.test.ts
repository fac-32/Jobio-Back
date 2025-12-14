import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import supabase from '../config/supabaseClient.js';
import testApp from './__mocks__/mockUserRoutes.js';

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

    describe('GET /users', () => {
        it('should return all users successfully', async () => {
            const mockData = [{ id: 1, name: 'John Doe' }];

            mockSupabaseValue.select.mockResolvedValue({
                data: mockData,
                error: null,
            });

            const res = await request(testApp).get('/users');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockData);
            expect(supabase.from).toHaveBeenCalledWith('users');
        });

        it('should handle database errors', async () => {
            mockSupabaseValue.select.mockResolvedValue({
                data: null,
                error: { message: 'Database Connection Error' },
            });

            const res = await request(testApp).get('/users');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Database Connection Error');
        });
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            const newUser = {
                auth_id: '123',
                name: 'Jane',
                email: 'jane@example.com',
            };

            mockSupabaseValue.insert.mockReturnThis();
            mockSupabaseValue.select.mockResolvedValue({
                data: [newUser],
                error: null,
            });

            const res = await request(testApp).post('/users').send(newUser);

            expect(res.status).toBe(201);
            expect(res.body[0].name).toBe('Jane');
        });
    });

    describe('PUT /users/:id', () => {
        it('should update a user successfully', async () => {
            const userId = '1';
            const updatedData = {
                auth_id: '123',
                name: 'John Updated',
                email: 'john@example.com',
            };

            mockSupabaseValue.update.mockReturnThis();
            mockSupabaseValue.eq.mockReturnThis();
            mockSupabaseValue.select.mockResolvedValue({
                data: [{ id: userId, ...updatedData }],
                error: null,
            });

            const res = await request(testApp)
                .put(`/users/${userId}`)
                .send(updatedData);

            expect(res.status).toBe(200);
            expect(res.body[0].name).toBe('John Updated');

            expect(mockSupabaseValue.update).toHaveBeenCalledWith(updatedData);
            expect(mockSupabaseValue.eq).toHaveBeenCalledWith('id', userId);
        });

        it('should return 500 if the update fails', async () => {
            mockSupabaseValue.update.mockReturnThis();
            mockSupabaseValue.eq.mockReturnThis();
            mockSupabaseValue.select.mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
            });

            const res = await request(testApp)
                .put('/users/1')
                .send({ name: 'Fail' });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Update failed');
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete a user successfully', async () => {
            mockSupabaseValue.delete.mockReturnThis();
            mockSupabaseValue.eq.mockReturnThis();
            mockSupabaseValue.select.mockResolvedValue({
                data: [{ id: '1' }],
                error: null,
            });

            const res = await request(testApp).delete('/users/1');

            expect(res.status).toBe(200);
            expect(mockSupabaseValue.delete).toHaveBeenCalled();
            expect(mockSupabaseValue.eq).toHaveBeenCalledWith('id', '1');
        });
    });
});
