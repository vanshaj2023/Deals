"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const google_1 = __importDefault(require("next-auth/providers/google"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = require("./mongoose");
const user_model_1 = __importDefault(require("./models/user.model"));
exports.authOptions = {
    providers: [
        (0, google_1.default)({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        (0, credentials_1.default)({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!(credentials === null || credentials === void 0 ? void 0 : credentials.email) || !(credentials === null || credentials === void 0 ? void 0 : credentials.password)) {
                    throw new Error('Please provide email and password');
                }
                await (0, mongoose_1.connectToDB)();
                const user = await user_model_1.default.findOne({ email: credentials.email });
                if (!user) {
                    throw new Error('No account found with this email');
                }
                if (!user.password) {
                    throw new Error('This account uses Google sign-in. Please sign in with Google or reset your password.');
                }
                const isPasswordValid = await bcryptjs_1.default.compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if ((account === null || account === void 0 ? void 0 : account.provider) === 'google') {
                await (0, mongoose_1.connectToDB)();
                let existingUser = await user_model_1.default.findOne({ email: user.email });
                if (!existingUser) {
                    existingUser = await user_model_1.default.create({
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: 'user',
                        emailVerified: new Date(),
                    });
                    console.log('New Google user created:', existingUser.email);
                }
                else {
                    if (!existingUser.image && user.image) {
                        existingUser.image = user.image;
                    }
                    if (!existingUser.emailVerified) {
                        existingUser.emailVerified = new Date();
                    }
                    await existingUser.save();
                    console.log('Linked Google account to existing user:', existingUser.email);
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                await (0, mongoose_1.connectToDB)();
                const dbUser = await user_model_1.default.findOne({ email: user.email });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.role = dbUser.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
