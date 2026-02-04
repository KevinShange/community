import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

type RouteParams = { params: Promise<{ draftId: string }> };

/**
 * DELETE /api/drafts/[draftId]
 * 刪除草稿，僅允許草稿所屬使用者刪除（依 x-user-handle 辨識）
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { draftId } = await params;
    const h = await headers();
    const userHandle = h.get('x-user-handle');
    if (!userHandle) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { handle: userHandle } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }
    if (draft.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.draft.delete({ where: { id: draftId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
