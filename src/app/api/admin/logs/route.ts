import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import AdminLog from '@/models/AdminLog';

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const targetType = searchParams.get('targetType');
    const dateRange = searchParams.get('dateRange') || 'week';

    // Build filter query
    const filter: Record<string, unknown> = {};
    
    if (action && action !== 'all') {
      filter.action = action;
    }
    
    if (targetType && targetType !== 'all') {
      filter['target.type'] = targetType;
    }

    // Date range filter
    const now = new Date();
    let dateFilter;
    
    switch (dateRange) {
      case 'today':
        dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        dateFilter = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all':
      default:
        dateFilter = null;
        break;
    }

    if (dateFilter) {
      filter.createdAt = { $gte: dateFilter };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await AdminLog.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get logs with pagination
    const logs = await AdminLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedLogs = logs.map(log => ({
      id: log._id.toString(),
      adminId: log.adminId.toString(),
      action: log.action,
      target: log.target,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({ 
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Admin logs fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
