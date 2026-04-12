import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { Link } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useVeraAuth, type UserRole, roleComplianceSchemas } from './hooks/useVeraAuth'

const ONBOARDING_ROLE_OPTIONS: Array<{ value: UserRole; label: string; description: string }> = [
  { value: 'OWNER', label: 'Owner', description: 'Register as the asset owner with AML/KYC compliance.' },
  { value: 'SURVEYOR', label: 'Surveyor', description: 'Register as a licensed surveyor for boundary verification.' },
  { value: 'REALTOR', label: 'Realtor', description: 'Register as a real estate advisor with brokerage compliance.' },
  { value: 'GOVT', label: 'Government Agent', description: 'Register as an official reviewer connected to regulatory oversight.' },
  { value: 'ORACLE', label: 'AI Oracle', description: 'Register as an automated data source provider for verification.' },
]

const ConsensusNode = ({ id, role, desc, isApproved, onToggle }: any) => (
  <div
    onClick={onToggle}
    className={`p-8 rounded-3xl border transition-all duration-300 cursor-pointer group relative overflow-hidden ${
      isApproved
        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 shadow-lg shadow-amber-500/10'
        : 'border-indigo-100 dark:border-indigo-900 bg-white dark:bg-indigo-900/40 hover:border-indigo-400'
    }`}
  >
    <div className="flex justify-between items-start mb-4">
      <span className={`text-xs font-black tracking-widest ${isApproved ? 'text-amber-600' : 'text-indigo-300 dark:text-indigo-700'}`}>
        NODE // {id}
      </span>
      {isApproved && (
        <span className="text-amber-600 dark:text-amber-400 text-xs font-bold animate-pulse">SIGNED</span>
      )}
    </div>
    <h3 className={`text-xl font-bold mb-3 ${isApproved ? 'text-indigo-900 dark:text-amber-400' : 'text-indigo-900 dark:text-white'}`}>
      {role}
    </h3>
    <p className="text-sm text-indigo-700/70 dark:text-indigo-300/60 leading-relaxed font-light">
      {desc}
    </p>
    {isApproved && <div className="absolute bottom-0 left-0 h-1 bg-amber-500 w-full" />}
  </div>
)

export default function Home() {
  const { activeAddress } = useWallet()
  const { user, registerUserRole } = useVeraAuth()
  const { enqueueSnackbar } = useSnackbar()

  const [selectedRole, setSelectedRole] = useState<UserRole>('OWNER')
  const [complianceValues, setComplianceValues] = useState<Record<string, string>>({})
  const [isRegistering, setIsRegistering] = useState(false)
  const [approvals, setApprovals] = useState<Record<string, boolean>>({
    '01': true,
    '02': false,
    '03': false,
    '04': false,
  })

  const currentSchema = roleComplianceSchemas[selectedRole]

  const toggleNode = (id: string) => {
    setApprovals((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const approvedCount = Object.values(approvals).filter(Boolean).length
  const isConsensusReached = approvedCount === 4

  const onComplianceChange = (key: string, value: string) => {
    setComplianceValues((current) => ({ ...current, [key]: value }))
  }

  const requiredFieldsComplete = currentSchema.fields.every((field) => {
    if (!field.required) return true
    return Boolean(complianceValues[field.key]?.trim())
  })

  const handleRoleRegistration = async () => {
    if (!activeAddress) {
      enqueueSnackbar('Connect your wallet before completing onboarding.', { variant: 'warning' })
      return
    }

    if (!requiredFieldsComplete) {
      enqueueSnackbar('Complete all required compliance fields before registering.', { variant: 'warning' })
      return
    }

    setIsRegistering(true)
    try {
      registerUserRole(activeAddress, selectedRole, complianceValues)
      enqueueSnackbar(`${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} registration completed.`, { variant: 'success' })
    } catch {
      enqueueSnackbar('Unable to complete role registration. Please try again.', { variant: 'error' })
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="bg-indigo-50 dark:bg-indigo-950 font-sans transition-colors duration-500 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-36">
        <div className="text-center">
          <div className="inline-block mb-6 px-4 py-1.5 bg-white dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-[0.2em] uppercase rounded-full shadow-sm">
            VeraTerra // Proof of Concept
          </div>

          <h1 className="mt-4 text-5xl sm:text-7xl font-extrabold text-indigo-900 dark:text-white leading-[1.1] tracking-tight">
            VeraTerra
          </h1>
          <p className="mt-4 text-2xl sm:text-3xl font-light text-indigo-700/80 dark:text-indigo-300/80">
            Trust-infrastructure for Digital Capital.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user.role === 'UNREGISTERED' ? '/' : '/dashboard'}
              className={`px-10 py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center ${
                activeAddress
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white hover:scale-105 hover:bg-indigo-700'
                  : 'bg-indigo-200 dark:bg-indigo-900 text-indigo-400 cursor-not-allowed'
              }`}
            >
              {activeAddress ? (user.role === 'UNREGISTERED' ? 'Complete Role Registration' : `Enter as ${user.label}`) : 'Access Protocol'}
            </Link>
          </div>
        </div>
      </div>

      {user.role === 'UNREGISTERED' && activeAddress && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="rounded-[2rem] border border-amber-500/20 bg-amber-950/80 p-10 shadow-2xl shadow-amber-900/30">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-300 font-black">Role Onboarding</p>
              <h2 className="mt-4 text-3xl font-black text-white">Register your role and compliance profile</h2>
              <p className="mt-3 text-slate-300">Select the role that matches your regulatory responsibility, then provide the required verification details to join the consensus network.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Selected role</label>
                  <select
                    value={selectedRole}
                    onChange={(event) => {
                      const nextRole = event.target.value as UserRole
                      setSelectedRole(nextRole)
                      setComplianceValues({})
                    }}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  >
                    {ONBOARDING_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-950 text-slate-100">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-400">Role summary</p>
                  <h3 className="mt-3 text-xl font-bold text-white">{currentSchema.title}</h3>
                  <p className="mt-2 text-slate-400">{currentSchema.description}</p>
                </div>

                <div className="space-y-4">
                  {currentSchema.fields.map((field) => (
                    <label key={field.key} className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-200">{field.label}</span>
                      <input
                        value={complianceValues[field.key] ?? ''}
                        onChange={(event) => onComplianceChange(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-5 py-4 text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleRoleRegistration}
                  disabled={isRegistering || !requiredFieldsComplete}
                  className="inline-flex items-center justify-center rounded-3xl bg-amber-500 px-6 py-4 text-base font-black uppercase tracking-[0.16em] text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRegistering ? 'Registering…' : 'Complete Onboarding'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Consensus Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16 border-b border-indigo-100 dark:border-indigo-900 pb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-indigo-900 dark:text-white tracking-tight">Consensus Engine</h2>
            <p className="mt-3 text-indigo-700/70 dark:text-indigo-300/60 max-w-2xl text-lg font-light">
              Simulate the multi-signature verification workflow below.
            </p>
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${
            isConsensusReached
              ? 'bg-amber-500 text-white border-amber-400'
              : 'bg-white dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900'
          }`}>
            <span className={`h-2 w-2 rounded-full ${isConsensusReached ? 'bg-white animate-pulse' : 'bg-amber-500'}`} />
            {isConsensusReached ? 'Consensus Reached' : `${approvedCount}/4 Signed`}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ConsensusNode id="01" role="AI Oracle" isApproved={approvals['01']} onToggle={() => toggleNode('01')} desc="Automated geospatial and title analysis." />
          <ConsensusNode id="02" role="Surveyor" isApproved={approvals['02']} onToggle={() => toggleNode('02')} desc="Physical boundary validation." />
          <ConsensusNode id="03" role="Realtor" isApproved={approvals['03']} onToggle={() => toggleNode('03')} desc="Market valuation assessment." />
          <ConsensusNode id="04" role="Govt Agent" isApproved={approvals['04']} onToggle={() => toggleNode('04')} desc="Regulatory registry alignment." />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-900 dark:bg-white text-white dark:text-indigo-950">
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h2 className="text-4xl font-bold mb-8 italic">Initiate Truth Engine</h2>
          <Link
            to={user.role === 'UNREGISTERED' ? '/' : '/dashboard'}
            className={`inline-block px-12 py-5 rounded-xl font-black text-lg transition-all shadow-2xl ${
              activeAddress ? 'bg-amber-500 text-white hover:scale-105' : 'bg-indigo-800 text-indigo-600 cursor-not-allowed opacity-50'
            }`}
          >
            {activeAddress ? 'Launch Registration Portal' : 'Connect Wallet to Start'}
          </Link>
        </div>
      </div>
    </div>
  )
}
