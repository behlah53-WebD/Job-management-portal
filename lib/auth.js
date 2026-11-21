import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { checkAuthLockout, recordFailedAuth, resetAuthLockout } from './ratelimit';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        // 1. Check progressive lockout
        const lockout = checkAuthLockout(normalizedEmail);
        if (lockout.locked) {
          throw new Error(`Account temporarily locked for security. Please try again in ${lockout.remainingSeconds}s.`);
        }

        await dbConnect();
        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user) {
          recordFailedAuth(normalizedEmail);
          throw new Error('Invalid email or password');
        }

        if (user.isBlocked) {
          throw new Error('Your account has been suspended. Please contact support.');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          recordFailedAuth(normalizedEmail);
          throw new Error('Invalid email or password');
        }

        // Reset lockout on successful credentials match
        resetAuthLockout(normalizedEmail);

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar || '',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      if (trigger === 'update' && session?.user) {
        token.name = session.user.name || token.name;
        token.avatar = session.user.avatar || token.avatar;
        token.role = session.user.role || token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
