import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { DirectMessageItem } from '@/types/models';

function toAuthor(u: { name: string; avatar: string | null; handle: string }) {
  return {
    name: u.name,
    avatar: u.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.handle}`,
    handle: u.handle,
  };
}

/**
 * GET /api/messages?with=handle
 * 取得與某使用者的私訊列表（依時間正序）。
 * Header: x-user-handle
 */
export async function GET(req: Request) {
  try {
    const h = await headers();
    const userHandle = h.get('x-user-handle');
    if (!userHandle) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const withHandle = searchParams.get('with');
    if (!withHandle) {
      return NextResponse.json({ error: 'Missing with=handle' }, { status: 400 });
    }

    const me = await prisma.user.findUnique({
      where: { handle: userHandle },
      select: { id: true, name: true, avatar: true, handle: true },
    });
    const other = await prisma.user.findUnique({
      where: { handle: withHandle },
      select: { id: true, name: true, avatar: true, handle: true },
    });
    if (!me || !other) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: me.id, receiverId: other.id },
          { senderId: other.id, receiverId: me.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { name: true, avatar: true, handle: true } },
        receiver: { select: { name: true, avatar: true, handle: true } },
      },
    });

    const list: DirectMessageItem[] = messages.map((m) => {
      const imageUrls = Array.isArray(m.imageUrls) ? (m.imageUrls as string[]) : undefined;
      return {
        id: m.id,
        sender: toAuthor(m.sender),
        receiver: toAuthor(m.receiver),
        content: m.content,
        imageUrls: imageUrls?.length ? imageUrls : undefined,
        createdAt: m.createdAt.toISOString(),
      };
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

/**
 * POST /api/messages
 * 發送私訊。body: { receiverHandle: string, content?: string, imageUrls?: string[] }
 * 至少要有 content 或 imageUrls 其一。
 * Header: x-user-handle
 */
export async function POST(req: Request) {
  try {
    const h = await headers();
    const userHandle = h.get('x-user-handle');
    if (!userHandle) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as {
      receiverHandle?: string;
      content?: string;
      imageUrls?: string[];
    };
    if (!body?.receiverHandle) {
      return NextResponse.json({ error: 'Missing receiverHandle' }, { status: 400 });
    }
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const imageUrls = Array.isArray(body.imageUrls)
      ? (body.imageUrls as string[]).filter((u): u is string => typeof u === 'string')
      : [];
    if (!content && imageUrls.length === 0) {
      return NextResponse.json({ error: 'Provide content or imageUrls' }, { status: 400 });
    }

    const sender = await prisma.user.findUnique({
      where: { handle: userHandle },
      select: { id: true },
    });
    const receiver = await prisma.user.findUnique({
      where: { handle: body.receiverHandle },
      select: { id: true },
    });
    if (!sender || !receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (sender.id === receiver.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    const created = await prisma.directMessage.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        content: content || '',
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      },
      include: {
        sender: { select: { name: true, avatar: true, handle: true } },
        receiver: { select: { name: true, avatar: true, handle: true } },
      },
    });

    const imageUrlsOut =
      Array.isArray(created.imageUrls) ? (created.imageUrls as string[]) : undefined;
    const item: DirectMessageItem = {
      id: created.id,
      sender: toAuthor(created.sender),
      receiver: toAuthor(created.receiver),
      content: created.content,
      imageUrls: imageUrlsOut?.length ? imageUrlsOut : undefined,
      createdAt: created.createdAt.toISOString(),
    };

    // 即時推播：通知收件人（與發送者其他分頁）有新訊息
    const { triggerPusher } = await import('@/lib/pusher');
    const receiverHandle = created.receiver.handle;
    const senderHandle = created.sender.handle;
    const channelReceiver = `user-messages-${receiverHandle}`;
    const channelSender = `user-messages-${senderHandle}`;
    await triggerPusher(channelReceiver, 'new-dm', item);
    if (channelSender !== channelReceiver) {
      await triggerPusher(channelSender, 'new-dm', item);
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
