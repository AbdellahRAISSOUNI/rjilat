import { NextRequest } from 'next/server';
import AdminLog from '@/models/AdminLog';
import dbConnect from './mongodb';

interface LogAction {
  adminId: string;
  action: string;
  target: {
    type: 'user' | 'post' | 'comment' | 'system';
    id?: string;
    username?: string;
    title?: string;
  };
  details: string;
  req?: NextRequest;
}

export async function logAdminAction({
  adminId,
  action,
  target,
  details,
  req
}: LogAction) {
  try {
    await dbConnect();

    const logEntry = new AdminLog({
      adminId,
      action,
      target,
      details,
      ipAddress: req ? getClientIP(req) : undefined,
      userAgent: req ? req.headers.get('user-agent') : undefined,
    });

    await logEntry.save();

    // Also log to console for immediate visibility
    console.log(`[ADMIN LOG] ${action} by ${adminId}: ${details}`);

  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
