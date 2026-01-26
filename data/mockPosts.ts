import type { Post } from '@/types/models';

/**
 * Mock 貼文資料
 * 至少 3 筆貼文，每筆至少 1 則留言
 */
export const mockPosts: Post[] = [
  {
    id: 1,
    author: {
      name: 'Design System',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DesignSystem',
      handle: '@designsystem',
    },
    content: 'Just launched our new design system! Check out the beautiful components and patterns we\'ve created. 🎨',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小時前
    likeCount: 1200,
    isLikedByMe: false,
    replyCount: 12,
    comments: [
      {
        id: 1,
        postId: 1,
        author: {
          name: 'Sarah Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen',
          handle: '@sarahchen',
        },
        content: 'This looks amazing! The color palette is perfect. 👏',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1小時前
        likeCount: 45,
        isLikedByMe: true,
      },
      {
        id: 2,
        postId: 1,
        author: {
          name: 'UI Master',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=UIMaster',
          handle: '@uimaster',
        },
        content: 'Great work! Can\'t wait to use it in my projects.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分鐘前
        likeCount: 23,
        isLikedByMe: false,
      },
    ],
  },
  {
    id: 2,
    author: {
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen',
      handle: '@sarahchen',
    },
    content: 'Working on some exciting new features for the platform. Can\'t wait to share them with everyone!',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4小時前
    likeCount: 562,
    isLikedByMe: true,
    replyCount: 24,
    comments: [
      {
        id: 3,
        postId: 2,
        author: {
          name: 'Tech Trends',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechTrends',
          handle: '@techtrends',
        },
        content: 'Looking forward to seeing what you\'ve built! 🚀',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3小時前
        likeCount: 89,
        isLikedByMe: false,
      },
      {
        id: 4,
        postId: 2,
        author: {
          name: 'Creative Studio',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CreativeStudio',
          handle: '@creativestudio',
        },
        content: 'Excited to try them out! Keep up the great work.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小時前
        likeCount: 34,
        isLikedByMe: true,
      },
    ],
  },
  {
    id: 3,
    author: {
      name: 'Minimalist Daily',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MinimalistDaily',
      handle: '@minimalistdaily',
    },
    content: '"Simplicity is the ultimate sophistication." - Leonardo da Vinci',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6小時前
    likeCount: 941,
    isLikedByMe: false,
    replyCount: 8,
    comments: [
      {
        id: 5,
        postId: 3,
        author: {
          name: 'Design System',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DesignSystem',
          handle: '@designsystem',
        },
        content: 'One of my favorite quotes! It perfectly captures the essence of good design.',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5小時前
        likeCount: 156,
        isLikedByMe: false,
      },
    ],
  },
  {
    id: 4,
    author: {
      name: 'Tech Trends',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechTrends',
      handle: '@techtrends',
    },
    content: 'The future of web development is looking brighter than ever. Here are the top 5 trends to watch in 2024.',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8小時前
    likeCount: 2100,
    isLikedByMe: true,
    replyCount: 56,
    comments: [
      {
        id: 6,
        postId: 4,
        author: {
          name: 'Sarah Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen',
          handle: '@sarahchen',
        },
        content: 'Great insights! I\'m particularly excited about the AI integration trends.',
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7小時前
        likeCount: 234,
        isLikedByMe: true,
      },
      {
        id: 7,
        postId: 4,
        author: {
          name: 'UI Master',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=UIMaster',
          handle: '@uimaster',
        },
        content: 'Can you share more details about trend #3?',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6小時前
        likeCount: 67,
        isLikedByMe: false,
      },
    ],
  },
];
