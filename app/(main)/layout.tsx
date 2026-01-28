import { ReactNode } from 'react';
import ThreeColumnLayout from '../components/ThreeColumnLayout';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <ThreeColumnLayout>{children}</ThreeColumnLayout>;
}
