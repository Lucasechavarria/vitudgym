
import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { SessionsService } from '@/services/sessions.service';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { user, profile, error } = await authenticateAndRequireRole(req, ['coach', 'admin', 'superadmin']);
    if (error) return error;

    try {
        const studentId = params.id;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '5');

        const { sessions, error: sessionsError } = await SessionsService.getUserSessionHistory(studentId, limit);

        if (sessionsError) {
            return NextResponse.json({ error: sessionsError.message }, { status: 500 });
        }

        return NextResponse.json({ sessions });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch student sessions' }, { status: 500 });
    }
}
