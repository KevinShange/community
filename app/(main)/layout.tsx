import { ReactNode } from 'react';
import ThreeColumnLayout from '../components/ThreeColumnLayout';
import AuthGuard from '../components/AuthGuard';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ThreeColumnLayout>{children}</ThreeColumnLayout>
    </AuthGuard>
  );
}
