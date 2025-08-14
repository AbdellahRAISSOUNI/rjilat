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

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Basic user stats
    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      activeUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ 
        createdAt: { 
          $gte: sixtyDaysAgo, 
          $lt: thirtyDaysAgo 
        } 
      }),
      // Active users: those who posted or commented in last 7 days
      User.countDocuments({
        $or: [
          { 
            _id: { 
              $in: await Post.distinct('userId', { createdAt: { $gte: sevenDaysAgo } }) 
            } 
          },
          { 
            _id: { 
              $in: await Comment.distinct('userId', { createdAt: { $gte: sevenDaysAgo } }) 
            } 
          }
        ]
      })
    ]);

    // Calculate growth rate
    const userGrowthRate = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : 0;

    // Registration trends (last 30 days)
    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing dates with 0 counts
    const trends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateString = date.toISOString().split('T')[0];
      const existing = registrationTrends.find(t => t._id === dateString);
      trends.push({
        date: dateString,
        count: existing ? existing.count : 0
      });
    }

    // Most active users with activity scores
    const mostActiveUsers = await User.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts'
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'userId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          postsCount: { $size: '$posts' },
          commentsCount: { $size: '$comments' },
          followersCount: { $size: '$followers' },
          activityScore: {
            $add: [
              { $multiply: [{ $size: '$posts' }, 5] }, // Posts worth 5 points
              { $multiply: [{ $size: '$comments' }, 2] }, // Comments worth 2 points
              { $size: '$followers' } // Followers worth 1 point each
            ]
          }
        }
      },
      {
        $sort: { activityScore: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          username: 1,
          postsCount: 1,
          commentsCount: 1,
          followersCount: 1,
          activityScore: 1,
          joinedAt: '$createdAt',
          lastActive: '$updatedAt'
        }
      }
    ]);

    // Engagement metrics
    const engagementStats = await User.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts'
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'userId',
          as: 'comments'
        }
      },
      {
        $group: {
          _id: null,
          avgPostsPerUser: { $avg: { $size: '$posts' } },
          avgCommentsPerUser: { $avg: { $size: '$comments' } },
          avgFollowersPerUser: { $avg: { $size: '$followers' } }
        }
      }
    ]);

    // Calculate retention rate (users who posted/commented after their first week)
    const retentionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    const analytics = {
      totalUsers,
      newUsersThisMonth,
      activeUsers,
      userGrowthRate,
      registrationTrends: trends,
      mostActiveUsers: mostActiveUsers.map(user => ({
        id: user._id.toString(),
        username: user.username,
        postsCount: user.postsCount,
        commentsCount: user.commentsCount,
        followersCount: user.followersCount,
        activityScore: user.activityScore,
        joinedAt: user.joinedAt.toISOString(),
        lastActive: user.lastActive.toISOString()
      })),
      engagementMetrics: {
        avgPostsPerUser: engagementStats[0]?.avgPostsPerUser || 0,
        avgCommentsPerUser: engagementStats[0]?.avgCommentsPerUser || 0,
        avgFollowersPerUser: engagementStats[0]?.avgFollowersPerUser || 0,
        userRetentionRate: retentionRate
      }
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('User analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
