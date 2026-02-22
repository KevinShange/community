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
 * 回傳對話列表：包含已追蹤使用者，以及有發過訊息給自己的使用者（每個對象代表一個聊天室）。
 * 每項帶 isFollowing 表示該聊天室對象是否為已追蹤使用者。
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

    const followingRows = await prisma.follow.findMany({
      where: { followerId: me.id },
      select: { followingId: true },
    });
    const followingIds = new Set(followingRows.map((f) => f.followingId));

    // 我發出的私訊（對方可為任何人）
    const sent = await prisma.directMessage.findMany({
      where: { senderId: me.id },
      orderBy: { createdAt: 'desc' },
      select: {
        content: true,
        imageUrls: true,
        createdAt: true,
        receiver: { select: { id: true, name: true, avatar: true, handle: true } },
      },
    });
    // 我收到的私訊（發送者可為任何人）
    const received = await prisma.directMessage.findMany({
      where: { receiverId: me.id },
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
      {
        partner: PartnerRow;
        lastAt: Date;
        content: string;
        imageUrls: string[] | null;
        lastFromMe: boolean;
      }
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
          lastFromMe: true,
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
          lastFromMe: false,
        });
      }
    }

    const partnerIds = Array.from(byPartnerId.keys());
    const readStates = await prisma.conversationRead.findMany({
      where: { userId: me.id, partnerId: { in: partnerIds } },
      select: { partnerId: true, lastReadAt: true },
    });
    const lastReadByPartner = new Map(
      readStates.map((r: { partnerId: string; lastReadAt: Date }) => [r.partnerId, r.lastReadAt])
    );

    const list: ConversationSummary[] = Array.from(byPartnerId.values()).map((entry) => {
      const lastReadAt = lastReadByPartner.get(entry.partner.id) ?? null;
      const hasUnread =
        !entry.lastFromMe && (!lastReadAt || entry.lastAt > lastReadAt);
      return {
        partner: toAuthor(entry.partner),
        isFollowing: followingIds.has(entry.partner.id),
        lastMessageFromPartner: !entry.lastFromMe,
        hasUnread,
        lastMessage: {
          content: entry.content,
          imageUrls: entry.imageUrls ?? undefined,
          createdAt: entry.lastAt.toISOString(),
        },
      };
    });

    list.sort((a, b) => {
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
