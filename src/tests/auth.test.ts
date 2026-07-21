import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';

let mongod: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Auth', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('rejects duplicate email registration', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      username: 'testuser2',
      email: 'test@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(409);
  });

  it('logs in with valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: 'test@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: 'test@example.com',
      password: 'WrongPassword',
    });
    expect(res.status).toBe(401);
  });
});
