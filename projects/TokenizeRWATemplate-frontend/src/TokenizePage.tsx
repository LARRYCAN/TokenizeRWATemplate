import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useWallet } from '@txnlab/use-wallet-react'
import { useVeraAuth } from './hooks/useVeraAuth'
import TokenizeAsset from './components/TokenizeAsset'
import { createVerificationCase } from './data/verificationCases'

/**
 * Tokenize Page
 * Main page for creating new Algorand Standard Assets (ASAs)
 */
export default function TokenizePage() {
  const { activeAddress } = useWallet()
  const { user } = useVeraAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [propertyName, setPropertyName] = useState('')
  const [location, setLocation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const registerProperty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!activeAddress) {
      enqueueSnackbar('Connect your wallet first to register a property.', { variant: 'warning' })
      return
    }

    if (user.role !== 'OWNER') {
      enqueueSnackbar('Only registered Owners can launch property verification cases.', { variant: 'warning' })
      return
    }

    if (!propertyName.trim() || !location.trim()) {
      enqueueSnackbar('Provide both property title and location before launching verification.', { variant: 'warning' })
      return
    }

    setIsSubmitting(true)
    try {
      const nextCase = createVerificationCase({
        propertyName: propertyName.trim(),
        location: location.trim(),
        ownerAddress: activeAddress,
        truthSheet: 'Owner submission received. Quad-consensus verification case is now active.',
        summary: 'Property registration has initiated a Verification Case for AI, Surveyor, Realtor and Government review.',
      })

      enqueueSnackbar(`Verification case ${nextCase.id} launched for ${propertyName}.`, { variant: 'success' })
      setPropertyName('')
      setLocation('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-indigo-950 min-h-screen py-12 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-900/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-amber-300 font-bold">Enterprise Pilot Workflow</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white">Register property and trigger a Verification Case</h1>
              <p className="mt-4 max-w-2xl text-slate-300">Launch your asset from paper-land into digital capital with a fully auditable, role-based approval workflow anchored to Algorand.</p>
            </div>
            <div className="text-right">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-3xl bg-amber-500 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400"
              >
                Audit Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="text-lg font-bold text-white">Quad Consensus</h2>
              <p className="mt-3 text-slate-400">Every property registration launches a Verification Case that stays Pending until these four nodes approve: AI Oracle, Surveyor, Realtor, Government Agent.</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="text-lg font-bold text-white">Investor-Ready Operations</h2>
              <p className="mt-3 text-slate-400">Governance-ready status, role-based decisions, and timestamped review records built for founders, operators, and institutions.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-900/30">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300 font-bold">Owner registration</p>
            <h2 className="mt-3 text-3xl font-black text-white">Open a new property verification case</h2>
          </div>

          {!activeAddress || user.role !== 'OWNER' ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-slate-300">
              <p className="text-lg font-semibold text-white">Owner-only access</p>
              <p className="mt-3 text-slate-400">Only registered Owners can launch property verification cases. Complete role onboarding on the home page, then return to open a new case.</p>
            </div>
          ) : (
            <form onSubmit={registerProperty} className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Property name</span>
              <input
                value={propertyName}
                onChange={(event) => setPropertyName(event.target.value)}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                placeholder="e.g. Beacon Ridge Estate"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Location / region</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                placeholder="e.g. Downtown Lagos, NG"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="col-span-full rounded-3xl bg-amber-500 px-6 py-4 text-base font-black uppercase tracking-[0.16em] text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Launching Case…' : 'Launch Verification Case'}
            </button>
          </form>
          )}
        </section>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-900/30">
          <TokenizeAsset />
        </section>
      </div>
    </div>
  )
}
