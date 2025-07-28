import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Bank E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;

  const adminUser = {
    email: 'admin1@scroogebank.com',
    password: 'adminpass123',
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

    const resRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...adminUser, role: 'ADMIN' });

    if (resRegister.status === 201) {
      expect(resRegister.body).toHaveProperty('id');
      expect(resRegister.body.email).toBe(adminUser.email);
      expect(resRegister.body).toHaveProperty('password');
    } else {
      expect(resRegister.status).toBe(400);
      expect(resRegister.body.message).toContain('Email already registered');
    }

    const resLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send(adminUser)
      .expect(201);

    adminToken = resLogin.body.access_token;

    const user = await prisma.user.findFirst({ where: { email: adminUser.email } });
    if (!user) throw new Error('Admin user not found');

    await prisma.account.create({
      data: {
        userId: user.id,
        balance: 1000,
      },
    });
    
    await prisma.deposit.create({
      data: {
        userId: user.id,
        amount: 1000,
      },
    });

    await prisma.loan.create({
      data: {
        userId: user.id,
        amount: 400,
      },
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('/bank/funds (GET)', () => {
    it('should return available funds (deposits - loans)', async () => {
      const res = await request(app.getHttpServer())
        .get('/bank/funds')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.amount).toBe(600);
    });

    it('should reject if no token provided', async () => {
      await request(app.getHttpServer())
        .get('/bank/funds')
        .expect(401);
    });

    it('should reject if user is not ADMIN', async () => {
      const email = 'user1@test.com';
      const password = 'password123';

      const user = await prisma.user.findFirst({ where: { email } });

      if (!user) {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email, password })
          .expect(201);
      }

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(201);

      const userToken = loginRes.body.access_token;

      await request(app.getHttpServer())
        .get('/bank/funds')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

  });
});
