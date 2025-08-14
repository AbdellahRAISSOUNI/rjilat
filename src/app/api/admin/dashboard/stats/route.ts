import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get current date and 30 days ago for growth calculation
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Get total counts
    const [totalUsers, totalPosts, totalComments] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
    ]);

    // Calculate total upvotes
    const totalUpvotesResult = await Post.aggregate([
      { $group: { _id: null, totalUpvotes: { $sum: { $size: '$upvotes' } } } }
    ]);
    const totalUpvotes = totalUpvotesResult[0]?.totalUpvotes || 0;

    // Calculate social metrics
    const followStatsResult = await User.aggregate([
      {
        $group: {
          _id: null,
          totalFollowRelationships: { $sum: { $size: '$followers' } },
          averageFollowersPerUser: { $avg: { $size: '$followers' } }
        }
      }
    ]);
    const socialStats = followStatsResult[0] || { totalFollowRelationships: 0, averageFollowersPerUser: 0 };

    // Get growth data (new users and posts in last 30 days)
    const [newUsersCount, newPostsCount] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Post.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    // Calculate growth percentages
    const userGrowth = totalUsers > 0 ? Math.round((newUsersCount / totalUsers) * 100) : 0;
    const postGrowth = totalPosts > 0 ? Math.round((newPostsCount / totalPosts) * 100) : 0;

    // Get recent users (last 5) with follow stats
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username createdAt followers following')
      .lean();

    // Get posts count for recent users
    const recentUserIds = recentUsers.map(user => user._id);
    const userPostCounts = await Post.aggregate([
      { $match: { userId: { $in: recentUserIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);
    const postCountMap = new Map(userPostCounts.map(item => [item._id.toString(), item.count]));

    // Get most followed users
    const mostFollowedUsers = await User.aggregate([
      { $addFields: { followersCount: { $size: '$followers' } } },
      { $sort: { followersCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts'
        }
      },
      {
        $project: {
          username: 1,
          followersCount: 1,
          postsCount: { $size: '$posts' }
        }
      }
    ]);

    // Get top upvoted posts
    const topUpvotedPosts = await Post.aggregate([
      { $addFields: { upvotesCount: { $size: '$upvotes' }, commentsCount: { $size: '$comments' } } },
      { $sort: { upvotesCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $project: {
          title: 1,
          upvotes: '$upvotesCount',
          comments: '$commentsCount',
          author: '$author.username'
        }
      }
    ]);

    // Get recent posts (last 5) with author info
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'username')
      .select('title createdAt userId')
      .lean();

    // Get engagement stats
    const postsWithStats = await Post.aggregate([
      {
        $group: {
          _id: null,
          avgUpvotes: { $avg: { $size: '$upvotes' } },
          avgComments: { $avg: { $size: '$comments' } }
        }
      }
    ]);

    // Get active users (users who have posted or commented in last 7 days)
    const [activeUsersPosts, activeUsersComments] = await Promise.all([
      Post.distinct('userId', { createdAt: { $gte: sevenDaysAgo } }),
      Comment.distinct('userId', { createdAt: { $gte: sevenDaysAgo } }),
    ]);

    const activeUsersSet = new Set([...activeUsersPosts.map(id => id.toString()), ...activeUsersComments.map(id => id.toString())]);
    const activeUsers = activeUsersSet.size;

    const engagementStats = {
      avgLikesPerPost: postsWithStats[0]?.avgUpvotes || 0,
      avgCommentsPerPost: postsWithStats[0]?.avgComments || 0,
      activeUsers,
    };

    // Format the response
    const stats = {
      totalUsers,
      totalPosts,
      totalComments,
      totalUpvotes,
      userGrowth,
      postGrowth,
      totalFollowRelationships: socialStats.totalFollowRelationships,
      averageFollowersPerUser: Math.round(socialStats.averageFollowersPerUser),
      recentUsers: recentUsers.map(user => ({
        id: user._id.toString(),
        username: user.username,
        createdAt: user.createdAt.toISOString(),
        followersCount: user.followers.length,
        postsCount: postCountMap.get(user._id.toString()) || 0,
      })),
      recentPosts: recentPosts.map(post => ({
        id: post._id.toString(),
        title: post.title,
        author: (post.userId as { username: string } | null)?.username || 'Unknown',
        createdAt: post.createdAt.toISOString(),
      })),
      mostFollowedUsers: mostFollowedUsers.map(user => ({
        id: user._id.toString(),
        username: user.username,
        followersCount: user.followersCount,
        postsCount: user.postsCount,
      })),
      topUpvotedPosts: topUpvotedPosts.map(post => ({
        id: post._id.toString(),
        title: post.title,
        author: post.author,
        upvotes: post.upvotes,
        comments: post.comments,
      })),
      engagementStats,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
