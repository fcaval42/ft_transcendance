import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Prisma est une interface qui permet de communiquer avec le client
// On ne l'initialise qu'une fois, en general au demarrage
export const prisma = new PrismaClient()

interface LoginInput {
  email: string;
  password: string;
}

export async function authenticateUser(input: LoginInput): Promise<CreateUserResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(input.password, user.password);
  if (!match) throw new Error('Invalid credentials');

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isOnline: true },
    select: {
      id: true,
      email: true,
      username: true,
      avatarUrl: true,
      isOnline: true,
      createdAt: true,
    },
  });

  return updatedUser;
}

export async function logoutUser(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { isOnline: false },
  });
}

interface CreateUserInput {
  email: string;
  password: string;
  username: string;
  avatarUrl?: string; // "?:" = Optionnel
}

interface CreateUserResult {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  createdAt: Date;
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(input.password, saltRounds);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      username: input.username,
      avatarUrl: input.avatarUrl,
    },
    select: {
      id: true,
      email: true,
      username: true,
      avatarUrl: true,
      isOnline: true,
      createdAt: true,
    },
  });

  return user;
}


// async function main() {
//   try {
//     const newUser = await createUser({
//       email: 'francoislatortue@caramail.fr',
//       password: 'CleaMaBFF',
//       username: 'Francois',
//       avatarUrl: 'https://i.etsystatic.com/20152144/r/il/5c9299/7106223899/il_fullxfull.7106223899_95no.jpg',
//     });
//     console.log('✅ Utilisateur créé:', newUser);
//   } catch (error) {
//     console.error('❌ Erreur:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Exécute si le fichier est lancé directement
// if (import.meta.url === `file://${process.argv[1]}`) {
//   main();
// }