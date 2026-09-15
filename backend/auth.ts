import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Prisma est une interface qui permet de communiquer avec le client
// On ne l'initialise qu'une fois, en general au demarrage
export const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export interface JwtPayload {
  userId: string;
  email: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    isOnline: boolean;
    createdAt: Date;
  };
  token: string;
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email } as JwtPayload,
    JWT_SECRET,
    { expiresIn: '24h' } // Le token expire au bout de 24h
  );
}

export async function authenticateUser(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(input.password, user.password ?? '');
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

  const token = generateToken(updatedUser.id, updatedUser.email);

  return { user: updatedUser, token };
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


export async function createUser(input: CreateUserInput): Promise<AuthResponse> {
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
  const token = generateToken(user.id, user.email);

  return { user, token };
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