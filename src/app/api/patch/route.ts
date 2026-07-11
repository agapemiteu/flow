import { NextResponse } from 'next/server';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  await wait(body.action === 'generate' ? 950 : 500);

  if (body.action === 'approve') {
    return NextResponse.json({
      status: 'approved',
      approvedBy: 'Human reviewer',
      appliedToSandbox: true,
      message: 'Candidate patch approved for the sandbox release only.',
    });
  }

  return NextResponse.json({
    status: 'ready_for_review',
    confidence: 0.84,
    filesChanged: 1,
    testsAdded: 1,
    summary: 'Start a status enquiry when connectivity returns and the transaction remains in an unknown state.',
  });
}
