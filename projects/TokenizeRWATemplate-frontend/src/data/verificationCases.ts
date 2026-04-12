export type VerificationRole = 'ORACLE' | 'SURVEYOR' | 'REALTOR' | 'GOVT'
export type DecisionState = 'Pending' | 'Approved' | 'Rejected'

export type CaseApproval = {
  role: VerificationRole
  label: string
  decision: DecisionState
  comment: string
  timestamp: string
}

export type VerificationCase = {
  id: string
  propertyName: string
  location: string
  ownerAddress: string
  status: DecisionState
  truthSheet: string
  summary: string
  createdAt: string
  approvals: CaseApproval[]
}

const STORAGE_KEY = 'vera_terra_verification_cases'

const defaultApprovals = (): CaseApproval[] => [
  { role: 'ORACLE', label: 'AI Oracle', decision: 'Pending', comment: '', timestamp: '' },
  { role: 'SURVEYOR', label: 'Surveyor', decision: 'Pending', comment: '', timestamp: '' },
  { role: 'REALTOR', label: 'Realtor', decision: 'Pending', comment: '', timestamp: '' },
  { role: 'GOVT', label: 'Government Agent', decision: 'Pending', comment: '', timestamp: '' },
]

const sampleCases: VerificationCase[] = [
  {
    id: 'CASE-0001',
    propertyName: 'Quartz Ridge Estate',
    location: 'Austin, TX',
    ownerAddress: 'OWNER-0xA1B2...907E',
    status: 'Pending',
    truthSheet: 'Title chain validated. Survey blueprint pending review from Realtor and Government node.',
    summary: 'Tokenization-ready, pending a full quad-consensus decision across AI, Surveyor, Realtor, and Government.',
    createdAt: new Date().toISOString(),
    approvals: defaultApprovals(),
  },
  {
    id: 'CASE-0002',
    propertyName: 'Sapphire Boulevard Tower',
    location: 'Lagos, NG',
    ownerAddress: 'OWNER-0xC3D4...E1F2',
    status: 'Approved',
    truthSheet: 'All four node approvals completed. Legal, valuation, geospatial, and regulatory anchors are aligned.',
    summary: 'Enterprise pilot case closed with audited approvals from all four verification nodes.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    approvals: [
      { role: 'ORACLE', label: 'AI Oracle', decision: 'Approved', comment: 'Automated title scan clean. No encumbrances.', timestamp: new Date(Date.now() - 84000000).toISOString() },
      { role: 'SURVEYOR', label: 'Surveyor', decision: 'Approved', comment: 'Boundary and GPS verified on site.', timestamp: new Date(Date.now() - 82000000).toISOString() },
      { role: 'REALTOR', label: 'Realtor', decision: 'Approved', comment: 'Market valuation meets premium-grade thresholds.', timestamp: new Date(Date.now() - 80000000).toISOString() },
      { role: 'GOVT', label: 'Government Agent', decision: 'Approved', comment: 'Registry match confirmed. Regulatory anchor issued.', timestamp: new Date(Date.now() - 78000000).toISOString() },
    ],
  },
]

export function loadVerificationCases(): VerificationCase[] {
  if (typeof window === 'undefined') return sampleCases

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCases))
      return sampleCases
    }
    return JSON.parse(saved) as VerificationCase[]
  } catch (error) {
    console.warn('[verificationCases] Failed to load from localStorage', error)
    return sampleCases
  }
}

export function persistVerificationCases(cases: VerificationCase[]): VerificationCase[] {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
  }
  return cases
}

export function deriveCaseStatus(approvals: CaseApproval[]): DecisionState {
  if (approvals.some((item) => item.decision === 'Rejected')) return 'Rejected'
  if (approvals.every((item) => item.decision === 'Approved')) return 'Approved'
  return 'Pending'
}

export function createVerificationCase(args: {
  propertyName: string
  location: string
  ownerAddress: string
  truthSheet?: string
  summary?: string
}): VerificationCase {
  const nextCase: VerificationCase = {
    id: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
    propertyName: args.propertyName,
    location: args.location,
    ownerAddress: args.ownerAddress,
    status: 'Pending',
    truthSheet: args.truthSheet ?? 'Registration completed. Verification case has been opened for full quad-consensus review.',
    summary: args.summary ?? 'New property registration triggered a verification case for enterprise-grade underwriting.',
    createdAt: new Date().toISOString(),
    approvals: defaultApprovals(),
  }

  const cases = loadVerificationCases()
  const next = [nextCase, ...cases]
  persistVerificationCases(next)
  return nextCase
}

export function applyDecision(
  caseId: string,
  role: VerificationRole,
  decision: 'Approved' | 'Rejected',
  comment: string,
): VerificationCase[] {
  const cases = loadVerificationCases()
  const next = cases.map((item) => {
    if (item.id !== caseId) return item

    const approvals = item.approvals.map((approval) => {
      if (approval.role !== role) return approval
      return {
        ...approval,
        decision,
        comment,
        timestamp: new Date().toISOString(),
      }
    })

    return {
      ...item,
      approvals,
      status: deriveCaseStatus(approvals),
      truthSheet:
        deriveCaseStatus(approvals) === 'Approved'
          ? 'Certified by all quad-consensus nodes. Asset is cleared for token issuance.'
          : item.truthSheet,
    }
  })

  persistVerificationCases(next)
  return next
}
