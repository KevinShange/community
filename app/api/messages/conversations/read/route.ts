import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/messages/conversations/read
 * 標記與某人的對話為已讀（打開聊天室時呼叫）。
 * Body: { partnerHandle: string }
 * Header: x-user-handle
 */
export async function POST(req: Request) {
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

    const body = await req.json().catch(() => ({}));
    const partnerHandle = typeof body.partnerHandle === 'string' ? body.partnerHandle.trim() : '';
    if (!partnerHandle) {
      return NextResponse.json({ error: 'Missing partnerHandle' }, { status: 400 });
    }

    const partner = await prisma.user.findUnique({
      where: { handle: partnerHandle },
      select: { id: true },
    });
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const now = new Date();
    await prisma.conversationRead.upsert({
      where: {
        userId_partnerId: { userId: me.id, partnerId: partner.id },
      },
      create: {
        userId: me.id,
        partnerId: partner.id,
        lastReadAt: now,
      },
      update: { lastReadAt: now },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error marking conversation read:', error);
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 });
  }
}
