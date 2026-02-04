import ProfileView from '@/app/components/ProfileView';

interface ProfileByHandlePageProps {
  params: {
    handle: string;
  };
}

export default function ProfileByHandlePage({ params }: ProfileByHandlePageProps) {
  // 動態路由：依網址中的 handle 顯示對應使用者的個人頁
  const decodedHandle = decodeURIComponent(params.handle);
  return <ProfileView viewedHandle={decodedHandle} />;
}

