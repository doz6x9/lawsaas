import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
  Users
} from 'lucide-react';

type MatterStatus = 'Intake' | 'Active' | 'Waiting' | 'Closing';
type DeadlineRisk = 'high' | 'medium' | 'low';
type PipelineStatus = 'Queued' | 'Processing' | 'Ready' | 'Needs Review';

interface DeadlineItem {
  id: string;
  label: string;
  dueDate: string;
  owner: string;
  risk: DeadlineRisk;
}

interface MatterDocument {
  id: string;
  name: string;
  version: string;
  status: 'Draft' | 'Ready' | 'Needs Review' | 'Signed' | 'Filed';
  updatedAt: string;
  expiresAt?: string;
}

interface TimelineItem {
  id: string;
  time: string;
  title: string;
  detail: string;
  type: 'note' | 'document' | 'deadline' | 'system';
}

interface Matter {
  id: string;
  title: string;
  client: string;
  counterparty: string;
  status: MatterStatus;
  owner: string;
  assistant: string;
  authority: string;
  officialNumber: string;
  krxId: string;
  nextAction: string;
  openedAt: string;
  deadlines: DeadlineItem[];
  documents: MatterDocument[];
  timeline: TimelineItem[];
}

interface PipelineJob {
  id: string;
  matterId: string;
  title: string;
  status: PipelineStatus;
  attempt: number;
  updatedAt: string;
  expiresAt?: string;
}

const matters: Matter[] = [
  {
    id: 'MAT-2026-014',
    title: 'Late payment demand package',
    client: 'Danube Media Kft.',
    counterparty: 'Pixel Market Bt.',
    status: 'Active',
    owner: 'Dr. Kovacs Anna',
    assistant: 'Nagy Petra',
    authority: 'Budapest-Capital Regional Court',
    officialNumber: '12.G.40.221/2026',
    krxId: 'KRX-EP-2026-78142',
    nextAction: 'Review generated demand letter before e-Papir submission',
    openedAt: '2026-05-18',
    deadlines: [
      { id: 'd1', label: 'Payment notice follow-up', dueDate: '2026-05-29', owner: 'Nagy Petra', risk: 'high' },
      { id: 'd2', label: 'Client status update', dueDate: '2026-06-02', owner: 'Dr. Kovacs Anna', risk: 'medium' }
    ],
    documents: [
      { id: 'doc1', name: 'Demand letter', version: 'v3', status: 'Ready', updatedAt: 'Today 09:20', expiresAt: '2026-06-01' },
      { id: 'doc2', name: 'Evidence bundle', version: 'v2', status: 'Needs Review', updatedAt: 'Yesterday 16:44' },
      { id: 'doc3', name: 'Power of attorney', version: 'v1', status: 'Signed', updatedAt: '2026-05-19' }
    ],
    timeline: [
      { id: 't1', time: 'Today 09:20', title: 'Document generated', detail: 'Demand letter v3 is ready for review.', type: 'document' },
      { id: 't2', time: 'Yesterday 16:44', title: 'Evidence imported', detail: '12 source images attached to the matter.', type: 'system' },
      { id: 't3', time: 'May 22', title: 'Client note', detail: 'Client confirmed the counterparty address and invoice total.', type: 'note' }
    ]
  },
  {
    id: 'MAT-2026-011',
    title: 'Trademark opposition response',
    client: 'Blue Finch Zrt.',
    counterparty: 'Northline GmbH',
    status: 'Waiting',
    owner: 'Dr. Toth Balazs',
    assistant: 'Kiss Dora',
    authority: 'Hungarian Intellectual Property Office',
    officialNumber: 'M2401132',
    krxId: 'KRX-HIPO-2026-16408',
    nextAction: 'Waiting for client approval on response draft',
    openedAt: '2026-05-09',
    deadlines: [
      { id: 'd3', label: 'Opposition response filing', dueDate: '2026-06-07', owner: 'Dr. Toth Balazs', risk: 'medium' }
    ],
    documents: [
      { id: 'doc4', name: 'Response draft', version: 'v5', status: 'Draft', updatedAt: 'Today 11:05' },
      { id: 'doc5', name: 'Client approval email', version: 'v1', status: 'Filed', updatedAt: '2026-05-21' }
    ],
    timeline: [
      { id: 't4', time: 'Today 11:05', title: 'Draft updated', detail: 'Trademark response draft v5 saved.', type: 'document' },
      { id: 't5', time: 'May 23', title: 'Deadline recalculated', detail: 'Filing deadline moved after holiday check.', type: 'deadline' }
    ]
  },
  {
    id: 'MAT-2026-009',
    title: 'Real estate purchase due diligence',
    client: 'Hillside Homes Kft.',
    counterparty: 'Private seller',
    status: 'Intake',
    owner: 'Dr. Szabo Eszter',
    assistant: 'Nagy Petra',
    authority: 'Land Registry',
    officialNumber: 'Not assigned',
    krxId: 'Pending',
    nextAction: 'Complete AML checklist and collect title sheet',
    openedAt: '2026-05-22',
    deadlines: [
      { id: 'd4', label: 'AML identification complete', dueDate: '2026-05-27', owner: 'Nagy Petra', risk: 'high' },
      { id: 'd5', label: 'Title sheet review', dueDate: '2026-05-30', owner: 'Dr. Szabo Eszter', risk: 'low' }
    ],
    documents: [
      { id: 'doc6', name: 'Client intake summary', version: 'v1', status: 'Ready', updatedAt: 'Today 08:10' }
    ],
    timeline: [
      { id: 't6', time: 'Today 08:10', title: 'Matter created', detail: 'Public intake promoted to matter.', type: 'system' }
    ]
  }
];

const pipelineJobs: PipelineJob[] = [
  { id: 'job1', matterId: 'MAT-2026-014', title: 'Demand letter packet', status: 'Ready', attempt: 1, updatedAt: 'Today 09:20', expiresAt: '2026-06-01' },
  { id: 'job2', matterId: 'MAT-2026-011', title: 'Trademark response bundle', status: 'Needs Review', attempt: 2, updatedAt: 'Today 11:05' },
  { id: 'job3', matterId: 'MAT-2026-009', title: 'AML checklist export', status: 'Queued', attempt: 1, updatedAt: 'Today 08:18' }
];

const statusStyles: Record<MatterStatus, string> = {
  Intake: 'bg-sky-50 text-sky-700 border-sky-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  Closing: 'bg-slate-100 text-slate-700 border-slate-300'
};

const riskStyles: Record<DeadlineRisk, string> = {
  high: 'text-red-700 bg-red-50 border-red-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  low: 'text-emerald-700 bg-emerald-50 border-emerald-200'
};

const pipelineStyles: Record<PipelineStatus, string> = {
  Queued: 'bg-slate-100 text-slate-700 border-slate-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  Ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Needs Review': 'bg-amber-50 text-amber-700 border-amber-200'
};

export const MatterWorkspace: React.FC = () => {
  const [selectedMatterId, setSelectedMatterId] = useState(matters[0].id);
  const selectedMatter = matters.find(matter => matter.id === selectedMatterId) ?? matters[0];

  const allDeadlines = useMemo(
    () =>
      matters
        .flatMap(matter => matter.deadlines.map(deadline => ({ ...deadline, matterTitle: matter.title, matterId: matter.id })))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    []
  );

  const generatedDocuments = useMemo(
    () => matters.flatMap(matter => matter.documents.map(document => ({ ...document, matterTitle: matter.title, matterId: matter.id }))),
    []
  );

  const openMatters = matters.filter(matter => matter.status !== 'Closing').length;
  const urgentDeadlines = allDeadlines.filter(deadline => deadline.risk === 'high').length;
  const readyDocuments = generatedDocuments.filter(document => document.status === 'Ready').length;

  return (
    <div className="min-h-full bg-[#FAF9F8] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1480px] mx-auto space-y-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0078D4]">Firm Workspace</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
              Matters, deadlines, documents
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              A single operating view for clients, matter status, generated files, assigned staff, notes, and filing checkpoints.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <UploadCloud className="h-4 w-4" />
              Import Intake
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-[#0078D4] px-3 py-2 text-sm font-medium text-white hover:bg-[#005A9E]">
              <Plus className="h-4 w-4" />
              New Matter
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Metric icon={Briefcase} label="Open matters" value={openMatters.toString()} detail="3 active workflows" />
          <Metric icon={CalendarDays} label="Urgent deadlines" value={urgentDeadlines.toString()} detail="Next 7 days" tone="red" />
          <Metric icon={FileText} label="Ready documents" value={readyDocuments.toString()} detail="Awaiting review or download" tone="green" />
          <Metric icon={ShieldCheck} label="Onboarding" value="67%" detail="AML and setup progress" tone="blue" />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Panel title="Matter Queue" action="View all">
              <div className="space-y-2">
                {matters.map(matter => (
                  <button
                    key={matter.id}
                    onClick={() => setSelectedMatterId(matter.id)}
                    className={`w-full rounded-md border p-4 text-left transition ${
                      matter.id === selectedMatterId
                        ? 'border-[#0078D4] bg-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{matter.title}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{matter.client}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[matter.status]}`}>
                        {matter.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>{matter.id}</span>
                      <span>{matter.deadlines.length} deadlines</span>
                    </div>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Onboarding Checklist">
              <div className="space-y-3">
                <ChecklistItem done label="Client profile created" />
                <ChecklistItem done label="Conflict check recorded" />
                <ChecklistItem label="AML identification complete" urgent />
                <ChecklistItem label="Engagement letter signed" />
                <ChecklistItem label="Cegkapu/e-Papir metadata attached" />
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title={selectedMatter.title} action={selectedMatter.id}>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <MatterFact label="Client" value={selectedMatter.client} />
                <MatterFact label="Counterparty" value={selectedMatter.counterparty} />
                <MatterFact label="Owner" value={selectedMatter.owner} />
                <MatterFact label="Assistant" value={selectedMatter.assistant} />
                <MatterFact label="Authority" value={selectedMatter.authority} />
                <MatterFact label="Official number" value={selectedMatter.officialNumber} />
              </div>
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next action</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedMatter.nextAction}</p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    <Archive className="h-3.5 w-3.5" />
                    {selectedMatter.krxId}
                  </span>
                </div>
              </div>
            </Panel>

            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
              <Panel title="Upcoming Deadlines">
                <div className="space-y-3">
                  {selectedMatter.deadlines.map(deadline => (
                    <DeadlineRow key={deadline.id} deadline={deadline} />
                  ))}
                </div>
              </Panel>

              <Panel title="Document Pipeline">
                <div className="space-y-3">
                  {pipelineJobs
                    .filter(job => job.matterId === selectedMatter.id)
                    .map(job => (
                      <PipelineRow key={job.id} job={job} />
                    ))}
                </div>
              </Panel>
            </div>

            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
              <Panel title="Matter Documents" action={`${selectedMatter.documents.length} files`}>
                <div className="overflow-hidden rounded-md border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Name</th>
                        <th className="px-4 py-3 text-left font-semibold">Version</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Updated</th>
                        <th className="px-4 py-3 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {selectedMatter.documents.map(document => (
                        <tr key={document.id}>
                          <td className="px-4 py-3 font-medium text-slate-900">{document.name}</td>
                          <td className="px-4 py-3 text-slate-500">{document.version}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {document.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{document.updatedAt}</td>
                          <td className="px-4 py-3 text-right">
                            <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#0078D4] hover:text-[#005A9E]">
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Matter Timeline">
                <div className="space-y-4">
                  {selectedMatter.timeline.map(item => (
                    <TimelineRow key={item.id} item={item} />
                  ))}
                  <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <MessageSquare className="h-4 w-4" />
                    Add Note
                  </button>
                </div>
              </Panel>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Panel title="Firm Deadline Radar" action={`${allDeadlines.length} tracked`}>
            <div className="space-y-3">
              {allDeadlines.slice(0, 5).map(deadline => (
                <div key={deadline.id} className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{deadline.label}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{deadline.matterTitle} · {deadline.owner}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${riskStyles[deadline.risk]}`}>
                      {deadline.dueDate}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Generated Document History" action={`${generatedDocuments.length} generated`}>
            <div className="space-y-3">
              {generatedDocuments.slice(0, 5).map(document => (
                <div key={`${document.matterId}-${document.id}`} className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{document.name}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{document.matterTitle} · {document.version}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-slate-600">{document.updatedAt}</p>
                    {document.expiresAt && <p className="mt-1 text-xs text-amber-700">Expires {document.expiresAt}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
};

interface MetricProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  tone?: 'blue' | 'green' | 'red';
}

const Metric: React.FC<MetricProps> = ({ icon: Icon, label, value, detail, tone = 'blue' }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-red-50 text-red-700 border-red-100'
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`rounded-md border p-2 ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
};

interface PanelProps {
  title: string;
  action?: string;
  children: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({ title, action, children }) => (
  <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {action && <span className="text-xs font-medium text-slate-500">{action}</span>}
    </div>
    {children}
  </section>
);

const MatterFact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-md border border-slate-200 bg-white p-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 truncate text-sm font-medium text-slate-900">{value}</p>
  </div>
);

const ChecklistItem: React.FC<{ label: string; done?: boolean; urgent?: boolean }> = ({ label, done, urgent }) => (
  <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
    {done ? (
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
    ) : urgent ? (
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
    ) : (
      <Clock className="h-5 w-5 shrink-0 text-slate-400" />
    )}
    <span className="text-sm font-medium text-slate-700">{label}</span>
  </div>
);

const DeadlineRow: React.FC<{ deadline: DeadlineItem }> = ({ deadline }) => (
  <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white p-3">
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-slate-900">{deadline.label}</p>
      <p className="mt-1 text-xs text-slate-500">{deadline.owner}</p>
    </div>
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${riskStyles[deadline.risk]}`}>
      {deadline.dueDate}
    </span>
  </div>
);

const PipelineRow: React.FC<{ job: PipelineJob }> = ({ job }) => (
  <div className="rounded-md border border-slate-200 bg-white p-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{job.title}</p>
        <p className="mt-1 text-xs text-slate-500">Attempt {job.attempt} · {job.updatedAt}</p>
      </div>
      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${pipelineStyles[job.status]}`}>
        {job.status}
      </span>
    </div>
    <div className="mt-3 flex items-center justify-between gap-3">
      <p className="text-xs text-slate-500">{job.expiresAt ? `Download expires ${job.expiresAt}` : 'No expiry set yet'}</p>
      <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#0078D4] hover:text-[#005A9E]">
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>
  </div>
);

const TimelineRow: React.FC<{ item: TimelineItem }> = ({ item }) => {
  const icons = {
    note: MessageSquare,
    document: FileText,
    deadline: CalendarDays,
    system: Users
  };
  const Icon = icons[item.type];

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-medium text-slate-900">{item.title}</p>
          <span className="text-xs text-slate-500">{item.time}</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
      </div>
    </div>
  );
};
