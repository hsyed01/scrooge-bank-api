import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('/users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let userToken: string;
  let userId: number;

  let adminToken: string;

  const user = {
    email: 'usertest@example.com',
    password: 'password123',
    role: 'USER',
  };

  const admin = {
    email: 'admintest@example.com',
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

  it('USER should get own data by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('email', user.email);
  });

  it('ADMIN should get all users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.some((u: any) => u.email === user.email)).toBe(true);
  });

  it('USER should not be allowed to get all users', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
