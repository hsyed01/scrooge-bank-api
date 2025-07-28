
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@scroogebank.com' },
    update: {},
    create: {
      email: 'admin@scroogebank.com',
      password,
      role: 'ADMIN',
      account: {
        create: {
          balance: 1000,
        },
      },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'user@scroogebank.com' },
    update: {},
    create: {
      email: 'user@scroogebank.com',
      password,
      role: 'USER',
      account: {
        create: {
          balance: 500,
        },
      },
    },
  });

  console.log({ user, customer });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });