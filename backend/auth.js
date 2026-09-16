"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.generateToken = generateToken;
exports.createUser = createUser;
exports.authenticateUser = authenticateUser;
exports.logoutUser = logoutUser;
exports.findOrCreateOAuthUser = findOrCreateOAuthUser;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Prisma est une interface qui permet de communiquer avec le client
// On ne l'initialise qu'une fois, en general au demarrage
exports.prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
function generateToken(userId, email) {
    return jsonwebtoken_1.default.sign({ userId, email }, JWT_SECRET, { expiresIn: '1h' } // Le token expire au bout de 1h
    );
}
async function createUser(input) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(input.password, saltRounds);
    const user = await exports.prisma.user.create({
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
async function authenticateUser(input) {
    const user = await exports.prisma.user.findUnique({ where: { email: input.email } });
    if (!user)
        throw new Error('Invalid credentials');
    const match = await bcrypt.compare(input.password, user.password ?? '');
    if (!match)
        throw new Error('Invalid credentials');
    const updatedUser = await exports.prisma.user.update({
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
async function logoutUser(userId) {
    await exports.prisma.user.update({
        where: { id: userId },
        data: { isOnline: false },
    });
}
/**
 * Trouve ou crée un utilisateur connecté via OAuth
 */
async function findOrCreateOAuthUser(input) {
    // 1. Chercher si l'utilisateur existe déjà via son ID OAuth
    let user = await exports.prisma.user.findFirst({
        where: {
            oauthProvider: input.provider,
            oauthId: input.providerId,
        },
    });
    // 2. S'il n'existe pas, créer le compte
    if (!user) {
        // Gestion du conflit de pseudo si le username 42 existe déjà localement
        let uniqueUsername = input.username;
        const existingUsername = await exports.prisma.user.findUnique({ where: { username: uniqueUsername } });
        if (existingUsername) {
            uniqueUsername = `${input.username}_${Math.floor(1000 + Math.random() * 9000)}`;
        }
        user = await exports.prisma.user.create({
            data: {
                email: input.email,
                username: uniqueUsername,
                avatarUrl: input.avatarUrl ?? "/assets/default-avatar.png",
                oauthProvider: input.provider,
                oauthId: input.providerId,
                isOnline: true,
            },
        });
    }
    else {
        // Mettre à jour le statut en ligne
        user = await exports.prisma.user.update({
            where: { id: user.id },
            data: { isOnline: true },
        });
    }
    // 3. Générer le JWT propre au serveur
    const token = generateToken(user.id, user.email);
    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            isOnline: user.isOnline,
            createdAt: user.createdAt,
        },
        token,
    };
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
