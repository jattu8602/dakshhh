import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Get environment variables for super admin authentication
const adminEmail = process.env.AMIND_EMAIL || 'chaurasiyajatin68@gmail.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'jattu@8602';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Super admin login
        if (credentials.email === adminEmail &&
            credentials.password === adminPassword) {
          return {
            id: '1',
            name: 'Super Admin',
            email: adminEmail,
            role: 'superadmin'
          };
        }

        // Regular user login will be implemented if needed

        // Return null if user credentials are invalid
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/',
  }
});

export { handler as GET, handler as POST };