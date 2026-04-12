import { useMemo, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

export type UserRole = 'OWNER' | 'SURVEYOR' | 'REALTOR' | 'GOVT' | 'ORACLE' | 'UNREGISTERED'

interface RoleComplianceField {
  key: string
  label: string
  placeholder: string
  required: boolean
}

interface RoleComplianceSchema {
  title: string
  description: string
  fields: RoleComplianceField[]
}

interface RoleRegistryEntry {
  role: UserRole
  details: Record<string, string>
  registeredAt: string
}

interface VeraUser {
  address: string | null
  role: UserRole
  label: string
  isProfessional: boolean
  isOwner: boolean
  registered: boolean
  compliance: Record<string, string>
}

const ROLE_REGISTRY_STORAGE_KEY = 'veraRoleRegistry'

const STATIC_ROLE_REGISTRY: Record<string, UserRole> = {
  'YOUR_ALGO_ADDRESS_HERE': 'SURVEYOR',
}

const loadRoleRegistry = (): Record<string, RoleRegistryEntry> => {
  if (typeof window === 'undefined') return {}

  try {
    const stored = window.localStorage.getItem(ROLE_REGISTRY_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Record<string, RoleRegistryEntry>) : {}
  } catch {
    return {}
  }
}

const persistRoleRegistry = (registry: Record<string, RoleRegistryEntry>) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(ROLE_REGISTRY_STORAGE_KEY, JSON.stringify(registry))
  } catch {
    // ignore storage write failures
  }
}

export const roleComplianceSchemas: Record<UserRole, RoleComplianceSchema> = {
  OWNER: {
    title: 'Owner Compliance Registration',
    description: 'Submit ownership credentials and AML/KYC attestations to onboard as a property sponsor.',
    fields: [
      { key: 'legalEntity', label: 'Legal Entity / Individual Name', placeholder: 'e.g. Beacon Ridge Holdings', required: true },
      { key: 'kycVerified', label: 'KYC / AML Declaration', placeholder: 'I confirm AML and KYC reviews are complete', required: true },
      { key: 'jurisdiction', label: 'Primary Jurisdiction', placeholder: 'e.g. Lagos, Nigeria', required: true },
    ],
  },
  SURVEYOR: {
    title: 'Surveyor Compliance Registration',
    description: 'Register your survey credentials and jurisdictional compliance statements.',
    fields: [
      { key: 'licenseNumber', label: 'Surveyor License Number', placeholder: 'e.g. SV-987654', required: true },
      { key: 'jurisdiction', label: 'Licensed Jurisdiction', placeholder: 'e.g. Lagos State, NG', required: true },
      { key: 'declaration', label: 'Professional Declaration', placeholder: 'I agree to follow property survey standards and local regulations.', required: true },
    ],
  },
  REALTOR: {
    title: 'Realtor Compliance Registration',
    description: 'Provide brokerage and anti-fraud attestation data for market review approval.',
    fields: [
      { key: 'brokerageLicense', label: 'Brokerage License Number', placeholder: 'e.g. BR-224488', required: true },
      { key: 'jurisdiction', label: 'License Jurisdiction', placeholder: 'e.g. California, USA', required: true },
      { key: 'amlAttestation', label: 'AML Attestation', placeholder: 'I certify anti-money-laundering checks have been performed.', required: true },
    ],
  },
  GOVT: {
    title: 'Government Agent Compliance Registration',
    description: 'Register your agency identity and regulatory mandate for official registry verification.',
    fields: [
      { key: 'agencyName', label: 'Agency / Department Name', placeholder: 'e.g. Land Registry Authority', required: true },
      { key: 'officialId', label: 'Official ID / Badge', placeholder: 'e.g. GOVT-112233', required: true },
      { key: 'mandate', label: 'Regulatory Mandate', placeholder: 'e.g. Title verification and property registry oversight', required: true },
    ],
  },
  ORACLE: {
    title: 'AI Oracle Compliance Registration',
    description: 'Onboard your data-source audit and model transparency profile for automated review.',
    fields: [
      { key: 'platformName', label: 'Oracle Platform Name', placeholder: 'e.g. TerraData Analytics', required: true },
      { key: 'dataSources', label: 'Data Source Transparency', placeholder: 'e.g. Satellite imagery, land registry feeds', required: true },
      { key: 'auditStatement', label: 'Audit Statement', placeholder: 'I confirm that the model and data sources conform to audit standards.', required: true },
    ],
  },
  UNREGISTERED: {
    title: 'Complete Role Registration',
    description: 'Select a role, provide the required compliance information, and onboard into the system.',
    fields: [],
  },
}

export const useVeraAuth = () => {
  const { activeAddress } = useWallet()
  const [registry, setRegistry] = useState<Record<string, RoleRegistryEntry>>(() => loadRoleRegistry())

  const registerUserRole = (address: string, role: UserRole, details: Record<string, string>) => {
    const nextRegistry = {
      ...registry,
      [address]: {
        role,
        details,
        registeredAt: new Date().toISOString(),
      },
    }

    setRegistry(nextRegistry)
    persistRoleRegistry(nextRegistry)
  }

  const user = useMemo(() => {
    if (!activeAddress) {
      return {
        address: null,
        role: 'UNREGISTERED' as UserRole,
        label: 'Visitor',
        isProfessional: false,
        isOwner: false,
        registered: false,
        compliance: {},
      }
    }

    const savedProfile = registry[activeAddress]
    const assignedRole = (savedProfile?.role ?? STATIC_ROLE_REGISTRY[activeAddress] ?? 'UNREGISTERED') as UserRole

    return {
      address: activeAddress,
      role: assignedRole,
      label: assignedRole === 'UNREGISTERED' ? 'Register' : assignedRole.charAt(0) + assignedRole.slice(1).toLowerCase(),
      isProfessional: ['SURVEYOR', 'REALTOR', 'GOVT', 'ORACLE'].includes(assignedRole),
      isOwner: assignedRole === 'OWNER',
      registered: assignedRole !== 'UNREGISTERED',
      compliance: savedProfile?.details ?? {},
    }
  }, [activeAddress, registry])

  return {
    user,
    isAuthenticated: !!activeAddress,
    registerUserRole,
    roleComplianceSchemas,
  }
}
