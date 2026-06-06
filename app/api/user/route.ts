import { withAdminAuth } from '@/lib/api/withAuth'
import { NextResponse } from 'next/server'

export const DELETE = withAdminAuth(async (_req, { user, admin }) => {
  try {
    await admin.from('USER_SUBSCRIPTIONS').delete().eq('user_id', user.id)
    await admin
      .from('USER_SETTINGS' as any)
      .delete()
      .eq('user_id', user.id)

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
})
