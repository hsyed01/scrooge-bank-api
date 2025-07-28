import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Account E2E', () => {
  let app: INestApplication;
  let jwt: string;
  let prisma: PrismaService;
  let userId: number;

  const testUser = {
    email: 'accountuser@scroogebank.com',
    password: 'password123',
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
      .send(testUser)
      .expect(201);

    userId = newUser.body.id;   

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    jwt = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('/account/open/:userId (POST)', () => {
    it('should open an account for the user', async () => {
      console.log(userId, 'userId');
      const res = await request(app.getHttpServer())
        .post(`/account/open/${userId}`)
        .set('Authorization', `Bearer ${jwt}`)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.userId).toBe(userId);
      expect(res.body.balance).toBe(0);
    });

    it('should return 400 if account already exists', async () => {
      const res = await request(app.getHttpServer())
        .post(`/account/open/${userId}`)
        .set('Authorization', `Bearer ${jwt}`)
        .expect(400);

      expect(res.body.message).toBe('User already has an account');
    });
  });

  describe('/account/close/:userId (DELETE)', () => {
    it('should close the account if balance is 0', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/account/close/${userId}`)
        .set('Authorization', `Bearer ${jwt}`)
        .expect(200);

      expect(res.body.userId).toBe(userId);
    });

    it('should return 404 if account already deleted', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/account/close/${userId}`)
        .set('Authorization', `Bearer ${jwt}`)
        .expect(404);

      expect(res.body.message).toBe('Account not found');
    });
  });
});
