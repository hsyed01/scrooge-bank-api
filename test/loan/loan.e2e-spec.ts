import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('/loan (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let userId: number;

  const user = {
    email: 'loanuser@test.com',
    password: 'testpass123',
    role: 'USER',
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

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(201);

    userToken = loginRes.body.access_token;
    await prisma.account.create({ data: { userId, balance: 0 } });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('should apply for a loan successfully', async () => {
    const res = await request(app.getHttpServer())
      .post(`/loan/${userId}/apply`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 300 })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.amount).toBe(300);
    expect(res.body.paid).toBe(0);
  });

  it('should pay part of the loan', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/loan/${userId}/pay`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 100 })
      .expect(200);

    expect(res.body.paid).toBeGreaterThan(0);
  });

  it('should get loan details', async () => {
    const res = await request(app.getHttpServer())
      .get(`/loan/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('amount');
    expect(res.body).toHaveProperty('paid');
    expect(res.body).toHaveProperty('remaining');
  });
});
