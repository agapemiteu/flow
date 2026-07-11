'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Activity01Icon,
  AiInnovation01Icon,
  Alert02Icon,
  ArrowRight01Icon,
  BankIcon,
  Bug01Icon,
  Clock01Icon,
  CodeIcon,
  DashboardSquare01Icon,
  GitBranchIcon,
  PlayIcon,
  Shield01Icon,
  SparklesIcon,
  TestTube01Icon,
  Tick02Icon,
  WorkflowSquare01Icon,
} from '@hugeicons/core-free-icons';
import styles from './page.module.css';

type Result = {
  status: 'failed' | 'passed';
  durationMs: number;
  affectedSessions: number;
  assertion: string;
  steps: { label: string; status: 'passed' | 'failed'; duration: number }[];
};

type PatchState = 'idle' | 'generating' | 'ready' | 'approved';

const journeys = [
  { id: 'FR-2041', title: 'Status enquiry missing after switch timeout', flow: 'Interbank transfer', sessions: 24, severity: 'Critical', status: 'Regressed' },
  { id: 'FR-1998', title: 'Duplicate submit after biometric retry', flow: 'Bill payment', sessions: 12, severity: 'High', status: 'Protected' },
  { id: 'FR-1964', title: 'Verification state lost during app resume', flow: 'Account upgrade', sessions: 31, severity: 'High', status: 'Protected' },
];

const scenario = `name: transfer-timeout-after-debit
flow: interbank-transfer
source: production-trace

given:
  debit_status: successful
  switch_response: timeout

when:
  network: restored

expect:
  status_enquiry: started
  duplicate_debit: false
  customer_state: pending_confirmation`;

const patch = `diff --git a/services/transfer-orchestrator.ts b/services/transfer-orchestrator.ts
@@ -118,6 +118,11 @@ export async function restoreTransferState(transaction) {
   const networkRestored = await connectivity.isOnline();

+  if (networkRestored && transaction.status === "UNKNOWN") {
+    await statusEnquiry.check(transaction.reference);
+    return markAsPendingConfirmation(transaction.id);
+  }
+
   return transaction;
 }`;

function Icon({ icon, size = 19 }: { icon: typeof BankIcon; size?: number }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8} />;
}

export default function Home() {
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);
  const [patchState, setPatchState] = useState<PatchState>('idle');
  const [tab, setTab] = useState<'workspace' | 'journeys' | 'integration'>('workspace');

  async function runReplay(patched = patchState === 'approved') {
    setRunning(true);
    setResult(null);
    const response = await fetch('/api/replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ release: '2.5.0-rc.3', journeyId: 'FR-2041', patched }),
    });
    setResult(await response.json());
    setRunning(false);
  }

  async function generatePatch() {
    setPatchState('generating');
    await fetch('/api/patch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', journeyId: 'FR-2041' }),
    });
    setPatchState('ready');
  }

  async function approvePatch() {
    await fetch('/api/patch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', journeyId: 'FR-2041' }),
    });
    setPatchState('approved');
    setTimeout(() => runReplay(true), 300);
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><div className={styles.logo}><span/><span/><span/></div><div><strong>FlowReplay</strong><small>Banking reliability lab</small></div></div>
        <div className={styles.bank}><Icon icon={BankIcon}/><div><strong>Wema sandbox</strong><small>Hackathon workspace</small></div></div>
        <nav>
          <button className={tab === 'workspace' ? styles.active : ''} onClick={() => setTab('workspace')}><Icon icon={DashboardSquare01Icon}/>Workspace</button>
          <button className={tab === 'journeys' ? styles.active : ''} onClick={() => setTab('journeys')}><Icon icon={WorkflowSquare01Icon}/>Journey library</button>
          <button className={tab === 'integration' ? styles.active : ''} onClick={() => setTab('integration')}><Icon icon={GitBranchIcon}/>Integration</button>
        </nav>
        <div className={styles.sidebarNote}><Icon icon={Shield01Icon}/><div><strong>Sandbox only</strong><span>No real customer data. Human approval required.</span></div></div>
      </aside>

      <main>
        <header className={styles.topbar}><div><span className={styles.liveDot}/>Live sandbox</div><div className={styles.release}>Release 2.5.0-rc.3</div></header>

        {tab === 'workspace' && <div className={styles.content}>
          <section className={styles.hero}>
            <div>
              <span className={styles.badge}><Icon icon={SparklesIcon} size={16}/>Hackathon build · working prototype</span>
              <h1>Every banking failure becomes a test the next release must pass.</h1>
              <p>FlowReplay captures a broken customer journey, compiles it into a deterministic simulation, proposes a candidate fix, and verifies the human-approved correction.</p>
              <div className={styles.heroActions}><button className={styles.primary} onClick={() => runReplay()}><Icon icon={PlayIcon}/>Run release replay</button><button className={styles.secondary} onClick={() => setTab('journeys')}>Explore journeys <Icon icon={ArrowRight01Icon} size={17}/></button></div>
            </div>
            <div className={styles.visual}>
              <div className={styles.visualTop}><span/><span/><span/><b>release-replay / FR-2041</b></div>
              <div className={styles.flowRow}><div className={styles.flowNode}><Icon icon={Activity01Icon}/><strong>Debit confirmed</strong><small>Ledger event received</small></div><Icon icon={ArrowRight01Icon}/><div className={styles.flowNodeWarn}><Icon icon={Clock01Icon}/><strong>Switch timeout</strong><small>8 seconds elapsed</small></div><Icon icon={ArrowRight01Icon}/><div className={styles.flowNodeFail}><Icon icon={Alert02Icon}/><strong>Missing enquiry</strong><small>Release regression</small></div></div>
              <div className={styles.visualResult}><div><span>24</span><small>matching sessions</small></div><div><span>38s</span><small>reproduction time</small></div><div><span>1</span><small>candidate patch</small></div></div>
            </div>
          </section>

          <section className={styles.stats}>
            <div><Icon icon={Shield01Icon}/><span>Journeys protected</span><strong>218</strong><small>+14 this week</small></div>
            <div><Icon icon={Bug01Icon}/><span>Regressions caught</span><strong>7</strong><small>before release</small></div>
            <div><Icon icon={Clock01Icon}/><span>Reproduction time</span><strong>38s</strong><small>from 47 minutes</small></div>
            <div><Icon icon={CodeIcon}/><span>Human reviews</span><strong>{patchState === 'approved' ? 0 : 1}</strong><small>required before apply</small></div>
          </section>

          <section className={styles.workspaceGrid}>
            <div className={styles.panel}>
              <div className={styles.panelHead}><div><span className={styles.kicker}>Captured journey</span><h2>FR-2041 · transfer timeout after debit</h2></div><span className={styles.dangerPill}>Critical</span></div>
              <div className={styles.timeline}>
                {['Transfer initiated','Debit confirmed','Switch timeout','Network restored','Status enquiry missing'].map((item, index) => <div key={item} className={index === 4 ? styles.timelineFail : index === 2 ? styles.timelineWarn : styles.timelineOk}><span>{index < 2 || index === 3 ? <Icon icon={Tick02Icon} size={15}/> : index === 2 ? <Icon icon={Clock01Icon} size={15}/> : <Icon icon={Alert02Icon} size={15}/>}</span><div><strong>{item}</strong><small>{index === 4 ? 'Expected event was never emitted' : index === 2 ? 'Payment switch did not respond' : 'Trace event preserved'}</small></div></div>)}
              </div>
              <pre>{scenario}</pre>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}><div><span className={styles.kicker}>Release replay</span><h2>Run against 2.5.0-rc.3</h2></div><Icon icon={TestTube01Icon}/></div>
              {!result && !running && <div className={styles.empty}><Icon icon={PlayIcon} size={28}/><strong>Ready to replay</strong><p>Inject the original failure conditions into the release candidate.</p><button className={styles.primary} onClick={() => runReplay()}><Icon icon={PlayIcon}/>Start replay</button></div>}
              {running && <div className={styles.empty}><div className={styles.spinner}/><strong>Replaying customer journey</strong><p>Restoring ledger, network and switch conditions...</p></div>}
              {result && <div className={styles.result}>
                <div className={result.status === 'passed' ? styles.passBanner : styles.failBanner}><Icon icon={result.status === 'passed' ? Tick02Icon : Alert02Icon}/><div><strong>{result.status === 'passed' ? 'Journey passed' : 'Release blocked'}</strong><span>{result.assertion}</span></div></div>
                <div className={styles.steps}>{result.steps.map(step => <div key={step.label}><span className={step.status === 'passed' ? styles.stepPass : styles.stepFail}><Icon icon={step.status === 'passed' ? Tick02Icon : Alert02Icon} size={15}/></span><strong>{step.label}</strong><small>{step.duration}ms</small></div>)}</div>
                {result.status === 'failed' && patchState === 'idle' && <button className={styles.primary} onClick={generatePatch}><Icon icon={AiInnovation01Icon}/>Generate candidate fix</button>}
              </div>}
            </div>
          </section>

          {(patchState === 'generating' || patchState === 'ready' || patchState === 'approved') && <section className={styles.patchSection}>
            <div className={styles.patchHeader}><div><span className={styles.kicker}>Human-controlled remediation</span><h2>Candidate patch</h2></div><span className={patchState === 'approved' ? styles.successPill : styles.reviewPill}>{patchState === 'approved' ? 'Approved in sandbox' : patchState === 'generating' ? 'Generating…' : 'Awaiting review'}</span></div>
            {patchState === 'generating' ? <div className={styles.patchLoading}><div className={styles.spinner}/><span>Generating test scaffold and minimal code diff…</span></div> : <div className={styles.patchGrid}><div><div className={styles.patchSummary}><Icon icon={AiInnovation01Icon}/><h3>Restore transaction status after reconnection</h3><p>One file changed. One regression test added. No automatic production deployment.</p><dl><div><dt>Confidence</dt><dd>84%</dd></div><div><dt>Files changed</dt><dd>1</dd></div><div><dt>Tests added</dt><dd>1</dd></div><div><dt>Scope</dt><dd>Sandbox</dd></div></dl>{patchState !== 'approved' && <button className={styles.primary} onClick={approvePatch}><Icon icon={Tick02Icon}/>Approve and verify</button>}</div></div><pre className={styles.diff}>{patch}</pre></div>}
          </section>}
        </div>}

        {tab === 'journeys' && <div className={styles.content}><div className={styles.pageTitle}><span className={styles.kicker}>Production memory</span><h1>Journey library</h1><p>Real failures become permanent release requirements.</p></div><div className={styles.journeyList}>{journeys.map(j => <div key={j.id}><div className={styles.journeyIcon}><Icon icon={j.status === 'Protected' ? Shield01Icon : Bug01Icon}/></div><div><span>{j.id} · {j.flow}</span><h3>{j.title}</h3><p>{j.sessions} matching sessions</p></div><div className={j.status === 'Protected' ? styles.successPill : styles.dangerPill}>{j.status}</div></div>)}</div></div>}

        {tab === 'integration' && <div className={styles.content}><div className={styles.pageTitle}><span className={styles.kicker}>Small integration surface</span><h1>Add FlowReplay to a banking flow.</h1><p>Capture sanitised journey events. Never capture PINs, OTPs or complete account numbers.</p></div><div className={styles.integrationGrid}><pre>{`import { FlowReplay } from "@flowreplay/sdk";

const replay = FlowReplay.init({
  project: "mobile-banking",
  release: process.env.RELEASE_SHA,
  redact: ["pin", "otp", "accountNumber"],
});

replay.capture("interbank-transfer", {
  expected: "status_enquiry_started",
  correlationId: transaction.reference,
});`}</pre><div className={styles.architecture}><div><Icon icon={Activity01Icon}/><strong>Capture</strong><span>Sanitised flow events</span></div><Icon icon={ArrowRight01Icon}/><div><Icon icon={TestTube01Icon}/><strong>Compile</strong><span>Deterministic scenario</span></div><Icon icon={ArrowRight01Icon}/><div><Icon icon={CodeIcon}/><strong>Verify</strong><span>Human-approved fix</span></div></div></div></div>}
      </main>
    </div>
  );
}
