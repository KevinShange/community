import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { Author, NotificationItem } from '@/types/models';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function toAuthor(u: { name: string; avatar: string | null; handle: string }): Author {
  return {
    name: u.name,
    avatar: u.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.handle}`,
    handle: u.handle,
  };
}

/**
 * GET /api/notifications
 * 回傳當前使用者的通知列表（按時間新到舊）。
 * Query: cursor (id), limit (default 20)
 * Header: x-user-handle
 */
export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = Math.min(
      parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
      MAX_LIMIT
    );

    const notifications = await prisma.notification.findMany({
      where: { targetUserId: me.id },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        actor: { select: { name: true, avatar: true, handle: true } },
      },
    });

    const readAt = me.notificationsReadAt?.getTime() ?? 0;
    const hasMore = notifications.length > limit;
    const list = hasMore ? notifications.slice(0, limit) : notifications;

    const items: NotificationItem[] = list.map((n) => ({
      id: n.id,
      type: n.type as NotificationItem['type'],
      actor: toAuthor(n.actor),
      postId: n.postId ?? undefined,
      commentId: n.commentId ?? undefined,
      createdAt: n.createdAt.toISOString(),
      isUnread: readAt === 0 ? true : n.createdAt.getTime() > readAt,
    }));

    const nextCursor = hasMore ? list[list.length - 1].id : undefined;

    return NextResponse.json({
      items,
      nextCursor: nextCursor ?? null,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
