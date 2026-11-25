import AuthShell from '@/components/auth/AuthShell';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account | Verdant',
  description: 'Join Verdant as a job seeker or employer to grow your career or build an intentional team.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <RegisterForm />
    </AuthShell>
  );
}
