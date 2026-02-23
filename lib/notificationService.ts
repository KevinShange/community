import type { PrismaClient } from '@prisma/client';

type CreateNotificationParams = {
  type: 'like' | 'repost' | 'reply' | 'follow';
  actorId: string;
  targetUserId: string;
  postId?: string;
  commentId?: string;
};

/**
 * 建立一筆通知（方案 B）。若 actor === target（例如自己按自己貼文）則不寫入。
 */
export async function createNotification(
  prisma: PrismaClient,
  params: CreateNotificationParams
): Promise<void> {
  const { type, actorId, targetUserId, postId, commentId } = params;
  if (actorId === targetUserId) return;

  await prisma.notification.create({
    data: {
      type,
      actorId,
      targetUserId,
      ...(postId != null && { postId }),
      ...(commentId != null && { commentId }),
    },
  });
}
