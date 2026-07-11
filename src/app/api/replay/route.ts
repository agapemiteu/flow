import { NextResponse } from 'next/server';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  await wait(850);
  const patched = Boolean(body.patched);

  return NextResponse.json({
    runId: `run_${Date.now()}`,
    release: body.release ?? '2.5.0-rc.3',
    journeyId: body.journeyId ?? 'FR-2041',
    status: patched ? 'passed' : 'failed',
    durationMs: patched ? 1240 : 1386,
    affectedSessions: 24,
    assertion: patched
      ? 'Status enquiry started after network restoration.'
      : 'Expected status enquiry after network restoration, but no event was emitted.',
    steps: [
      { label: 'Load customer journey', status: 'passed', duration: 92 },
      { label: 'Confirm ledger debit', status: 'passed', duration: 184 },
      { label: 'Inject switch timeout', status: 'passed', duration: 312 },
      { label: 'Restore network', status: 'passed', duration: 171 },
      { label: 'Check status enquiry', status: patched ? 'passed' : 'failed', duration: patched ? 481 : 627 },
    ],
  });
}
