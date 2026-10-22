/**
 * Creates (or resets the password of) an administrator account.
 *
 *   ADMIN_EMAIL=you@domain.sn ADMIN_PASSWORD='…' node dist/scripts/create-admin.js
 *   docker compose exec -e ADMIN_EMAIL=… -e ADMIN_PASSWORD=… api node dist/scripts/create-admin.js
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL et ADMIN_PASSWORD sont requis');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD doit contenir au moins 12 caractères');
  }

  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hash, role: Role.ADMIN, isActive: true },
      create: {
        email,
        password: hash,
        firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.ADMIN_LAST_NAME || 'Sen Biopest',
        role: Role.ADMIN,
      },
    });
    console.log(`Administrateur prêt : ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
