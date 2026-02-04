import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type IncomingAuthor = {
  name: string;
  avatar?: string;
  handle: string;
};

async function getOrCreateUser(author: IncomingAuthor) {
  return prisma.user.upsert({
    where: { handle: author.handle },
    update: {
      name: author.name,
      avatar: author.avatar,
    },
    create: {
      name: author.name,
      avatar: author.avatar,
      handle: author.handle,
    },
  });
}

/**
 * POST /api/profile/follow
 * 切換追蹤狀態：
 * - body: { viewer: { name, avatar?, handle }, targetHandle: string }
 * - 回傳: { isFollowing, followingCount, followersCount }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      viewer?: IncomingAuthor;
      targetHandle?: string;
    };

    if (!body?.viewer?.handle || !body?.viewer?.name) {
      return NextResponse.json({ error: 'Missing viewer' }, { status: 400 });
    }
    if (!body?.targetHandle) {
      return NextResponse.json({ error: 'Missing targetHandle' }, { status: 400 });
    }

    const viewer = await getOrCreateUser(body.viewer);

    const target = await prisma.user.findUnique({
      where: { handle: body.targetHandle },
      select: { id: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (target.id === viewer.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewer.id,
          followingId: target.id,
        },
      },
      select: { id: true },
    });

    let isFollowing = false;

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      isFollowing = false;
    } else {
      await prisma.follow.create({
        data: {
          follower: { connect: { id: viewer.id } },
          following: { connect: { id: target.id } },
        },
      });
      isFollowing = true;
    }

    const [followingCount, followersCount] = await Promise.all([
      prisma.follow.count({ where: { followerId: target.id } }),
      prisma.follow.count({ where: { followingId: target.id } }),
    ]);

    return NextResponse.json({
      isFollowing,
      followingCount,
      followersCount,
    });
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}

