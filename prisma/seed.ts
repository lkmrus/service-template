import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedPlans() {
  const plans = [
    {
      planId: 'plan_basic_monthly',
      name: 'Basic Monthly',
      description: 'Entry plan billed monthly',
      price: 9.99,
      currency: 'USD',
      interval: 'month' as const,
    },
    {
      planId: 'plan_premium_yearly',
      name: 'Premium Yearly',
      description: 'Premium access billed yearly',
      price: 199.99,
      currency: 'USD',
      interval: 'year' as const,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { planId: plan.planId },
      update: plan,
      create: plan,
    });
  }
}

async function seedUsersAndCustomers() {
  const userEmail = 'billing.admin@example.com';
  const password = await bcrypt.hash('ChangeMe123!', 10);

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      password,
    },
  });

  await prisma.customer.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      customerId: `cust_${user.id}`,
      userId: user.id,
    },
  });

  await prisma.balance.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      amountIn: 0,
      amountOut: 0,
    },
  });
}

async function main() {
  await seedPlans();
  await seedUsersAndCustomers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
