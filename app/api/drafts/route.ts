import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * GET /api/drafts
 * 依 x-user-handle 查詢當前使用者的草稿列表
 */
export async function GET() {
  try {
    const h = await headers();
    const userHandle = h.get('x-user-handle');
    if (!userHandle) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { handle: userHandle } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const drafts = await prisma.draft.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const list = drafts.map((d) => ({
      id: d.id,
      content: d.content,
      createdAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drafts
 * 新增草稿，body: { content }，依 x-user-handle 辨識使用者
 */
export async function POST(req: Request) {
  try {
    const h = await headers();
    const userHandle = h.get('x-user-handle');
    if (!userHandle) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { handle: userHandle } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = (await req.json()) as { content?: string };
    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const draft = await prisma.draft.create({
      data: {
        content,
        user: { connect: { id: user.id } },
      },
    });

    return NextResponse.json(
      {
        id: draft.id,
        content: draft.content,
        createdAt: draft.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}
