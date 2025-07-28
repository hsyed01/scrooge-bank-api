import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('/withdrawal (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let userToken: string;
  let adminToken: string;
  let userId: number;

  const user = {
    email: 'user.withdrawal@test.com',
    password: 'password123',
    role: 'USER',
  };

  const admin = {
    email: 'admin.withdrawal@test.com',
    password: 'password123',
    role: 'ADMIN',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.deleteMany();
      await tx.deposit.deleteMany();
      await tx.loan.deleteMany();
      await tx.account.deleteMany();
      await tx.user.deleteMany();
    });

    const newUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);
    userId = newUser.body.id;

    const loginUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(201);

    userToken = loginUser.body.access_token;

    await prisma.account.upsert({
      where: { userId },
      update: { balance: 1000 },
      create: {
        userId,
        balance: 1000,
      },
    });


    await request(app.getHttpServer())
      .post('/auth/register')
      .send(admin)
      .expect(201);

    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: admin.email, password: admin.password })
      .expect(201);

    adminToken = loginAdmin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('USER withdrawal', () => {
    it('should allow user to withdraw funds', async () => {
      const res = await request(app.getHttpServer())
        .post('/withdrawal')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 200 })
        .expect(201);

      expect(res.body).toHaveProperty('newBalance');
      expect(res.body.newBalance).toBe(800);
    });

    it('should not allow withdrawal with insufficient funds', async () => {
      await prisma.account.update({
        where: { userId },
        data: { balance: 100 },
      });

      await request(app.getHttpServer())
        .post('/withdrawal')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 200 })
        .expect(400);
    });

    it('should forbid USER from accessing admin-only route', async () => {
      await request(app.getHttpServer())
        .get('/withdrawal')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('ADMIN withdrawal history', () => {
    it('should allow admin to view all withdrawals', async () => {
      const res = await request(app.getHttpServer())
        .get('/withdrawal')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
