'use client';

import { useEffect, useRef } from 'react';
import { getPusherClient, isPusherConfigured } from '@/lib/pusher-client';
import { usePostStore } from '@/store/usePostStore';
import type { Post, Comment } from '@/types/models';

const MAX_POST_CHANNELS = 50;

export default function PusherSubscriber() {
  const { posts, updatePostById, prependPostFromRealtime, removePostById } = usePostStore();
  const feedSubscribedRef = useRef(false);

  useEffect(() => {
    if (!isPusherConfigured()) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    // 訂閱 feed：新發文即時推播（只訂閱一次）
    if (!feedSubscribedRef.current) {
      feedSubscribedRef.current = true;
      const feedChannel = pusher.subscribe('feed');
      feedChannel.bind('new-post', (data: Post) => {
        prependPostFromRealtime(data);
      });
      feedChannel.bind('post-deleted', (data: { postId: string }) => {
        removePostById(data.postId);
      });
    }

    // 訂閱目前列表中的貼文頻道：點讚、留言即時更新
    const postIds = [...new Set(posts.map((p) => String(p.id)))].slice(0, MAX_POST_CHANNELS);
    const subscribed = new Set<string>();
    for (const postId of postIds) {
      const channelName = `post-${postId}`;
      const channel = pusher.subscribe(channelName);
      subscribed.add(channelName);

      channel.bind('post-like-updated', (data: { likeCount: number }) => {
        updatePostById(postId, { likeCount: data.likeCount });
      });
      channel.bind('new-comment', (data: { comment: Comment; postId: string }) => {
        updatePostById(data.postId, (prev) => ({
          ...prev,
          replyCount: prev.replyCount + 1,
          comments: [...prev.comments, data.comment],
        }));
      });
      channel.bind('comment-like-updated', (data: { commentId: string; likeCount: number }) => {
        updatePostById(postId, (prev) => ({
          ...prev,
          comments: prev.comments.map((c) =>
            String(c.id) === String(data.commentId) ? { ...c, likeCount: data.likeCount } : c
          ),
        }));
      });
    }

    return () => {
      for (const channelName of subscribed) {
        const ch = pusher.channel(channelName);
        if (ch) {
          ch.unbind();
          pusher.unsubscribe(channelName);
        }
      }
    };
  }, [posts, updatePostById, prependPostFromRealtime, removePostById]);

  return null;
}
