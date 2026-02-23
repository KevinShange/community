import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/notifications/read
 * 將當前使用者的通知標記為已讀（更新 notificationsReadAt），進入 Notifications 頁時呼叫。
 * Header: x-user-handle
 */
export async function POST() {
  try {
    const h = await headers();
    const userHandle = h.get('x-user-handle');
    if (!userHandle) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { handle: userHandle },
      data: { notificationsReadAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 });
  }
}
