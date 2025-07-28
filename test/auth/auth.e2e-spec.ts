import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    email: 'user1@scroogebank.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });


  afterAll(async () => {
    await app.close();
  });


  describe('/auth/register (POST)', () => {
    it('should register a new user or return 400 if already exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      if (res.status === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(testUser.email);
        expect(res.body).toHaveProperty('password');
      } else {
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Email already registered');
      }
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login and return JWT token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('should fail login with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...testUser, password: 'wrongPassword' })
        .expect(401);
    });

    it('should fail login with non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'fake@example.com', password: '123456' })
        .expect(404);
    });
  });
});
