import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Deposit E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let userToken: string;
  let adminToken: string;
  let userId: number;

  const user = { email: 'user1@test.com', password: 'password123' };
  const admin = { email: 'admin1@test.com', password: 'adminpass123', role: 'ADMIN' };

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
    
    const newUser = await request(app.getHttpServer()).post('/auth/register').send(user).expect(201);
    userId = newUser.body.id;
    

    const loginUser = await request(app.getHttpServer()).post('/auth/login').send(user).expect(201);

    userToken = loginUser.body.access_token;
    await prisma.account.create({ data: { userId, balance: 0 } });

    await request(app.getHttpServer()).post('/auth/register').send(admin).expect(201);

    const loginAdmin = await request(app.getHttpServer()).post('/auth/login').send(admin).expect(201);
    adminToken = loginAdmin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('USER actions', () => {
    it('should allow deposit and update account balance', async () => {
      const amount = 500;

      const res = await request(app.getHttpServer())
        .post(`/deposit`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount })
        .expect(201);

      const account = await prisma.account.findUnique({ where: { userId } });
      expect(res.body).toHaveProperty('newBalance');
      expect(res.body.newBalance).toBe(account?.balance);

      const deposit = await prisma.deposit.findFirst({ where: { userId } });
      expect(deposit?.amount).toBe(amount);
    });

    it('should reject zero or negative deposit amount', async () => {
      await request(app.getHttpServer())
        .post(`/deposit`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: -100 })
        .expect(400);
    });

    it('should reject USER trying to fetch all deposits', async () => {
      await request(app.getHttpServer())
        .get('/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('ADMIN actions', () => {
    it('should fetch all user deposits', async () => {
      const res = await request(app.getHttpServer())
        .get('/deposit')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('userId');
      expect(res.body[0]).toHaveProperty('amount');
    });
  });
});
