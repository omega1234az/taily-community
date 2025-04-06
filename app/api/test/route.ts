import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { options } from '../auth/[...nextauth]/option'

export async function GET(request: NextRequest) {
  const session = await getServerSession(options)

  console.log('session', session)

  return NextResponse.json({
    message: 'test',
  })
}
