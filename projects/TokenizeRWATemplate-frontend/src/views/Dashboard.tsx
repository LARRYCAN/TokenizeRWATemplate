import { useMemo, useState } from 'react'
import { useSnackbar } from 'notistack'
import { useVeraAuth } from '../hooks/useVeraAuth'
import { Link } from 'react-router-dom'
import {
  applyDecision,
  loadVerificationCases,
  VerificationCase,
} from '../data/verificationCases'

export default function Dashboard() {
  const { user, isAuthenticated } = useVeraAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [cases, setCases] = useState<VerificationCase[]>(() => loadVerificationCases())
  const [comments, setComments] = useState<Record<string, string>>({})
  const [loadingCase, setLoadingCase] = useState<string | null>(null)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-white">Authentication Required</h2>
          <p className="text-indigo-600 dark:text-indigo-400 mt-2">Please connect your wallet to access the portal.</p>
          <Link to="/" className="mt-6 inline-block text-indigo-500 font-bold hover:underline">← Back to Home</Link>
        </div>
      </div>
    )
  }

  if (user.role === 'UNREGISTERED') {
    return (
      <div className="min-h-screen bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center p-4">
        <div className="max-w-xl rounded-[2rem] border border-amber-500/20 bg-slate-900/90 p-10 text-center shadow-2xl shadow-amber-900/20">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300 font-black">Role Onboarding Required</p>
          <h2 className="mt-4 text-3xl font-black text-white">Complete role registration first</h2>
          <p className="mt-3 text-slate-400">Your wallet is connected, but your role has not been registered. Please complete your role and regulatory compliance profile on the home page.</p>
          <Link to="/" className="mt-8 inline-flex items-center justify-center rounded-3xl bg-amber-500 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400">
            Go to onboarding
          </Link>
        </div>
      </div>
    )
  }

  const ownerCases = useMemo(
    () => cases.filter((item) => item.ownerAddress === user.address),
    [cases, user.address],
  )

  const awaitingCases = useMemo(
    () =>
      cases.filter((item) =>
        item.approvals.some((approval) => approval.role === user.role && approval.decision === 'Pending'),
      ),
    [cases, user.role],
  )

  const totalPending = cases.filter((item) => item.status === 'Pending').length
  const totalApproved = cases.filter((item) => item.status === 'Approved').length

  const handleCommentChange = (caseId: string, value: string) => {
    setComments((current) => ({ ...current, [caseId]: value }))
  }

  const handleDecision = (caseId: string, decision: 'Approved' | 'Rejected') => {
    const comment = comments[caseId]?.trim()

    if (!comment) {
      enqueueSnackbar('Please add a comment before recording your decision.', { variant: 'warning' })
      return
    }

    setLoadingCase(caseId)
    try {
      const nextCases = applyDecision(caseId, user.role as any, decision, comment)
      setCases(nextCases)
      enqueueSnackbar(`Case ${caseId} has been ${decision.toLowerCase()}.`, { variant: 'success' })
      setComments((current) => ({ ...current, [caseId]: '' }))
    } catch {
      enqueueSnackbar('Unable to record decision. Please try again.', { variant: 'error' })
    } finally {
      setLoadingCase(null)
    }
  }

  return (
    <div className="min-h-screen bg-indigo-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <header className="grid gap-4 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 sm:grid-cols-[1.5fr_auto]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-400 font-black">VeraTerra Enterprise Network</p>
            <h1 className="mt-4 text-4xl font-black text-white tracking-tight">Role-Based Verification Command Center</h1>
            <p className="mt-4 max-w-2xl text-slate-300">Every registered property generates a Verification Case. Approved only when all four consensus nodes finish their review with comments and timestamps.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Signed in as</p>
            <p className="mt-2 text-xl font-bold text-white">{user.label}</p>
            <p className="mt-1 text-sm text-slate-400 uppercase tracking-[0.2em]">{user.isOwner ? 'Owner Dashboard' : 'Professional Dashboard'}</p>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Active Cases</p>
            <p className="mt-6 text-4xl font-black text-white">{cases.length}</p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pending</p>
            <p className="mt-6 text-4xl font-black text-white">{totalPending}</p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Approved</p>
            <p className="mt-6 text-4xl font-black text-white">{totalApproved}</p>
          </article>
        </section>

        {user.isOwner ? (
          <section className="mt-10 space-y-6">
            <div className="rounded-3xl border border-amber-800 bg-slate-900/90 p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300 font-black">Owner view</p>
              <h2 className="mt-4 text-3xl font-black text-white">Registered Properties & Truth Sheets</h2>
              <p className="mt-3 text-slate-400">Track every case your address has initiated and the verified truth sheet for each asset.</p>
            </div>

            {ownerCases.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-slate-400">
                No registered properties found. Use the tokenization portal to launch your first verification case.
              </div>
            ) : (
              <div className="grid gap-6">
                {ownerCases.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.id}</p>
                        <h3 className="text-2xl font-black text-white">{item.propertyName}</h3>
                        <p className="mt-2 text-sm text-slate-400">{item.location}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                        item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : item.status === 'Rejected' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-6 rounded-3xl bg-slate-900/80 p-6 border border-slate-800">
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Truth Sheet</p>
                      <p className="mt-3 text-slate-300 leading-relaxed">{item.truthSheet}</p>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-950/90 p-4 border border-slate-800">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Created</p>
                        <p className="mt-2 text-sm text-slate-300">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-950/90 p-4 border border-slate-800">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Approvals</p>
                        <p className="mt-2 text-sm text-slate-300">{item.approvals.filter((a) => a.decision === 'Approved').length}/4</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="mt-10 space-y-6">
            <div className="rounded-3xl border border-amber-800 bg-slate-900/90 p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300 font-black">Professional review</p>
              <h2 className="mt-4 text-3xl font-black text-white">Awaiting your decision</h2>
              <p className="mt-3 text-slate-400">Approve or reject cases assigned to your role. Every decision must include a comment and a timestamp.</p>
            </div>

            {awaitingCases.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-slate-400">
                There are no cases awaiting your decision right now. Monitor the queue for new property registrations.
              </div>
            ) : (
              <div className="grid gap-6">
                {awaitingCases.map((item) => {
                  const roleApproval = item.approvals.find((approval) => approval.role === user.role)
                  const caseComment = comments[item.id] ?? ''

                  return (
                    <article key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.id}</p>
                          <h3 className="text-2xl font-black text-white">{item.propertyName}</h3>
                          <p className="mt-2 text-sm text-slate-400">{item.location}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 border border-amber-500/20">
                          {user.label} decision pending
                        </span>
                      </div>

                      <div className="mt-6 rounded-3xl bg-slate-900/80 p-6 border border-slate-800">
                        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Case summary</p>
                        <p className="mt-3 text-slate-300 leading-relaxed">{item.summary}</p>
                      </div>

                      <label className="mt-6 block text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Decision comment</label>
                      <textarea
                        value={caseComment}
                        onChange={(event) => handleCommentChange(item.id, event.target.value)}
                        rows={5}
                        className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-5 py-4 text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        placeholder="Summarize your validation rationale and any material findings."
                      />

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                          disabled={!caseComment.trim() || loadingCase === item.id}
                          onClick={() => handleDecision(item.id, 'Rejected')}
                          className="rounded-3xl bg-red-500/10 px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-red-300 border border-red-500/20 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          disabled={!caseComment.trim() || loadingCase === item.id}
                          onClick={() => handleDecision(item.id, 'Approved')}
                          className="rounded-3xl bg-emerald-500 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Approve
                        </button>
                      </div>

                      {roleApproval?.timestamp && (
                        <div className="mt-6 rounded-3xl bg-slate-900/80 p-4 border border-slate-800 text-sm text-slate-400">
                          <p>Last decision recorded at: {new Date(roleApproval.timestamp).toLocaleString()}</p>
                          <p className="mt-1">Comment: {roleApproval.comment}</p>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}

        <div className="mt-12 text-center">
          <Link to="/tokenize" className="inline-flex items-center justify-center rounded-3xl bg-slate-100 px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-slate-900/20 transition hover:bg-slate-200">
            Launch New Property Case
          </Link>
        </div>
      </div>
    </div>
  )
}
