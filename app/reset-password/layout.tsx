import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réinitialisation du mot de passe | Resto Istanbul',
  description: 'Réinitialisez votre mot de passe pour accéder à votre compte Resto Istanbul.',
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
