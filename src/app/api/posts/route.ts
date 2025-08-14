import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Parse form data
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const image = formData.get('image') as File;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (title.length > 100) {
      return NextResponse.json({ error: 'Title must be less than 100 characters' }, { status: 400 });
    }

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(buffer, 'rjilat/posts');

    // Create post in database
    const newPost = new Post({
      title: title.trim(),
      imageUrl: cloudinaryResult.secure_url,
      imagePublicId: cloudinaryResult.public_id,
      userId: token.sub,
      upvotes: [],
      comments: [],
    });

    await newPost.save();

    return NextResponse.json(
      {
        message: 'Post created successfully',
        post: {
          id: newPost._id.toString(),
          title: newPost.title,
          imageUrl: newPost.imageUrl,
          createdAt: newPost.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'newest';
    
    // Get user token to check upvote status
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build aggregation pipeline for sorting by popularity
    const pipeline: Array<Record<string, unknown>> = [
      // Filter for active posts only
      {
        $match: {
          status: { $ne: 'hidden' }
        }
      },
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
          commentsCount: { $size: '$comments' }
        }
      }
    ];

    // Add sorting
    if (sortBy === 'popular') {
      pipeline.push({ $sort: { upvotesCount: -1, createdAt: -1 } });
    } else if (sortBy === 'oldest') {
      pipeline.push({ $sort: { createdAt: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Execute aggregation
    const [posts, totalResult] = await Promise.all([
      Post.aggregate(pipeline),
      Post.countDocuments({ status: { $ne: 'hidden' } })
    ]);

    // Format response and check upvote status
    const formattedPosts = posts.map(post => {
      let hasUpvoted = false;
      if (token && token.type === 'user') {
        hasUpvoted = post.upvotes.some((upvoteId: string) => upvoteId.toString() === token.sub);
      }

      return {
        id: post._id.toString(),
        title: post.title,
        imageUrl: post.imageUrl,
        author: {
          id: post.author._id.toString(),
          username: post.author.username,
        },
        upvotesCount: post.upvotesCount,
        commentsCount: post.commentsCount,
        hasUpvoted,
        createdAt: post.createdAt.toISOString(),
      };
    });

    const totalPages = Math.ceil(totalResult / limit);

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total: totalResult,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Posts fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
