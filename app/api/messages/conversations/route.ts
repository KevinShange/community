import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { Author, ConversationSummary } from '@/types/models';

function toAuthor(u: { name: string; avatar: string | null; handle: string }): Author {
  return {
    name: u.name,
    avatar: u.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.handle}`,
    handle: u.handle,
  };
}

/**
 * GET /api/messages/conversations
 * 回傳與「當前使用者有追蹤關係」的對話列表（僅顯示有至少一則訊息的對象）。
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
      select: { id: true },
    });
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 我追蹤的人（完整資料）
    const following = await prisma.user.findMany({
      where: {
        id: { in: (await prisma.follow.findMany({ where: { followerId: me.id }, select: { followingId: true } })).map((f) => f.followingId) },
      },
      select: { id: true, name: true, avatar: true, handle: true },
    });
    const followingIds = following.map((u) => u.id);

    // 與我有私訊往來的最近一則
    const sent = await prisma.directMessage.findMany({
      where: { senderId: me.id, receiverId: { in: followingIds } },
      orderBy: { createdAt: 'desc' },
      select: {
        content: true,
        imageUrls: true,
        createdAt: true,
        receiver: { select: { id: true, name: true, avatar: true, handle: true } },
      },
    });
    const received = await prisma.directMessage.findMany({
      where: { receiverId: me.id, senderId: { in: followingIds } },
      orderBy: { createdAt: 'desc' },
      select: {
        content: true,
        imageUrls: true,
        createdAt: true,
        sender: { select: { id: true, name: true, avatar: true, handle: true } },
      },
    });

    type PartnerRow = { id: string; name: string; avatar: string | null; handle: string };
    const byPartnerId = new Map<
      string,
      { partner: PartnerRow; lastAt: Date; content: string; imageUrls: string[] | null }
    >();

    for (const row of sent) {
      const pid = row.receiver.id;
      const existing = byPartnerId.get(pid);
      if (!existing || row.createdAt > existing.lastAt) {
        const urls = Array.isArray(row.imageUrls) ? (row.imageUrls as string[]) : null;
        byPartnerId.set(pid, {
          partner: row.receiver,
          lastAt: row.createdAt,
          content: row.content,
          imageUrls: urls,
        });
      }
    }
    for (const row of received) {
      const pid = row.sender.id;
      const existing = byPartnerId.get(pid);
      if (!existing || row.createdAt > existing.lastAt) {
        const urls = Array.isArray(row.imageUrls) ? (row.imageUrls as string[]) : null;
        byPartnerId.set(pid, {
          partner: row.sender,
          lastAt: row.createdAt,
          content: row.content,
          imageUrls: urls,
        });
      }
    }

    // 左欄：所有我追蹤的人，有訊息的排前面並帶 lastMessage，沒訊息的 lastMessage 為 null
    const withLast: ConversationSummary[] = following.map((partner) => {
      const entry = byPartnerId.get(partner.id);
      if (entry) {
        return {
          partner: toAuthor(partner),
          lastMessage: {
            content: entry.content,
            imageUrls: entry.imageUrls ?? undefined,
            createdAt: entry.lastAt.toISOString(),
          },
        };
      }
      return { partner: toAuthor(partner), lastMessage: null };
    });
    const list = withLast.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
