import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
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

    // Basic content stats
    const [
      totalPosts,
      totalComments,
      newPostsThisMonth,
      newPostsLastMonth
    ] = await Promise.all([
      Post.countDocuments(),
      Comment.countDocuments(),
      Post.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Post.countDocuments({ 
        createdAt: { 
          $gte: sixtyDaysAgo, 
          $lt: thirtyDaysAgo 
        } 
      })
    ]);

    // Calculate total upvotes
    const upvotesResult = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: { $size: '$upvotes' } }
        }
      }
    ]);
    const totalUpvotes = upvotesResult[0]?.totalUpvotes || 0;

    // Calculate growth rate
    const contentGrowthRate = newPostsLastMonth > 0 
      ? ((newPostsThisMonth - newPostsLastMonth) / newPostsLastMonth) * 100 
      : 0;

    // Top performing posts
    const topPosts = await Post.aggregate([
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
        $addFields: {
          upvotesCount: { $size: '$upvotes' },
          commentsCount: { $size: '$comments' },
          totalEngagement: {
            $add: [
              { $multiply: [{ $size: '$upvotes' }, 2] }, // Upvotes worth 2 points
              { $size: '$comments' } // Comments worth 1 point
            ]
          }
        }
      },
      {
        $sort: { totalEngagement: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          title: 1,
          author: '$author.username',
          upvotesCount: 1,
          commentsCount: 1,
          createdAt: 1
        }
      }
    ]);

    // Content trends (last 30 days)
    const contentTrends = await Promise.all([
      // Posts per day
      Post.aggregate([
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
            posts: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),
      // Comments per day
      Comment.aggregate([
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
            comments: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
    ]);

    // Merge and fill missing dates
    const trends = [];
    const postTrendsMap = new Map(contentTrends[0].map(t => [t._id, t.posts]));
    const commentTrendsMap = new Map(contentTrends[1].map(t => [t._id, t.comments]));

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateString = date.toISOString().split('T')[0];
      trends.push({
        date: dateString,
        posts: postTrendsMap.get(dateString) || 0,
        comments: commentTrendsMap.get(dateString) || 0
      });
    }

    const analytics = {
      totalPosts,
      totalComments,
      totalUpvotes,
      contentGrowthRate,
      topPosts: topPosts.map(post => ({
        id: post._id.toString(),
        title: post.title,
        author: post.author,
        upvotesCount: post.upvotesCount,
        commentsCount: post.commentsCount,
        createdAt: post.createdAt.toISOString()
      })),
      contentTrends: trends
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Content analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
