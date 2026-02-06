import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * GET /api/profile
 * 依 x-user-handle 查詢當前使用者的個人檔案（顯示名稱、經歷、生日、頭像、背景圖）
 */
export async function GET() {
  try {
    const h = await headers();
    const userHandle = h.get('x-user-handle');
    const viewerHandle = h.get('x-viewer-handle');
    if (!userHandle) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { handle: userHandle },
      select: {
        id: true,
        name: true,
        avatar: true,
        coverImage: true,
        handle: true,
        bio: true,
        birthday: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 計算追蹤數與粉絲數
    const [followingCount, followersCount] = await Promise.all([
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.follow.count({ where: { followingId: user.id } }),
    ]);

    // 判斷目前查看者是否已追蹤此使用者
    let isFollowing = false;
    if (viewerHandle) {
      const viewer = await prisma.user.findUnique({
        where: { handle: viewerHandle },
        select: { id: true },
      });
      if (viewer && viewer.id !== user.id) {
        const existing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewer.id,
              followingId: user.id,
            },
          },
          select: { id: true },
        });
        isFollowing = !!existing;
      }
    }

    return NextResponse.json({
      name: user.name,
      avatar: user.avatar,
      coverImage: user.coverImage,
      handle: user.handle,
      bio: user.bio ?? '',
      birthday: user.birthday ? user.birthday.toISOString().slice(0, 10) : null,
      joinedAt: user.createdAt.toISOString(),
      followingCount,
      followersCount,
      isFollowing,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * 更新當前使用者的顯示名稱、經歷、生日；body: { name?, bio?, birthday? }
 */
export async function PATCH(req: Request) {
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

    const body = (await req.json()) as {
      name?: string;
      bio?: string;
      birthday?: string | null;
      avatar?: string | null;
      coverImage?: string | null;
    };

    const data: {
      name?: string;
      bio?: string | null;
      birthday?: Date | null;
      avatar?: string | null;
      coverImage?: string | null;
    } = {};

    if (typeof body.name === 'string') {
      const trimmed = body.name.trim();
      if (trimmed.length > 0) data.name = trimmed;
    }
    if (body.bio !== undefined) {
      data.bio = typeof body.bio === 'string' ? body.bio.trim() || null : null;
    }
    if (body.birthday !== undefined) {
      if (body.birthday === null || body.birthday === '') {
        data.birthday = null;
      } else if (typeof body.birthday === 'string') {
        const d = new Date(body.birthday);
        if (!Number.isNaN(d.getTime())) data.birthday = d;
      }
    }
    if (body.avatar !== undefined) {
      data.avatar = typeof body.avatar === 'string' ? body.avatar.trim() || null : null;
    }
    if (body.coverImage !== undefined) {
      data.coverImage = typeof body.coverImage === 'string' ? body.coverImage.trim() || null : null;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: {
        name: true,
        bio: true,
        birthday: true,
        avatar: true,
        coverImage: true,
      },
    });

    return NextResponse.json({
      name: updated.name,
      bio: updated.bio ?? '',
      birthday: updated.birthday ? updated.birthday.toISOString().slice(0, 10) : null,
      avatar: updated.avatar ?? null,
      coverImage: updated.coverImage ?? null,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
