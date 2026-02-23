import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/notifications/has-unread
 * 回傳當前使用者是否有未讀通知（用於左欄小圓點）。
 * Header: x-user-handle
 */
export async function GET() {
  try {
    const h = await headers();
    const userHandle = h.get('x-user-handle');
    if (!userHandle) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { handle: userHandle },
      select: { id: true, notificationsReadAt: true },
    });
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (me.notificationsReadAt == null) {
      const anyNotification = await prisma.notification.findFirst({
        where: { targetUserId: me.id },
        select: { id: true },
      });
      return NextResponse.json({ hasUnread: !!anyNotification });
    }

    const hasUnread = await prisma.notification.findFirst({
      where: {
        targetUserId: me.id,
        createdAt: { gt: me.notificationsReadAt },
      },
      select: { id: true },
    });

    return NextResponse.json({ hasUnread: !!hasUnread });
  } catch (error) {
    console.error('Error checking notifications unread:', error);
    return NextResponse.json({ error: 'Failed to check unread' }, { status: 500 });
  }
}
