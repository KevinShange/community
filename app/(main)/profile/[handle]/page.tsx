import ProfileView from '@/app/components/ProfileView';

interface ProfileByHandlePageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProfileByHandlePage({ params }: ProfileByHandlePageProps) {
  // Next.js 15+ 動態路由 params 為 Promise，需 await
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  return <ProfileView viewedHandle={decodedHandle} />;
}

