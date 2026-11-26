import { ADMIN_ROOMS } from '@/features/dashboards/school-admin/mocks/admin-catalog'
import type {
  AdminEstablishmentSettings,
  AdminRoomOption,
} from '@/features/dashboards/school-admin/types'

const STORAGE_KEY = 'tdc.admin.settings'

const DEFAULT_SETTINGS: AdminEstablishmentSettings = {
  name: 'Lycée Démo Porto-Novo',
  city: 'Porto-Novo',
  address: 'Avenue des Écoles, Porto-Novo',
  phone: '+229 01 00 00 00',
  email: 'contact@lycee-demo.td',
  schoolYear: '2025-2026',
  weekdaysLabel: 'Lun – Sam',
  dayStart: '07:30',
  dayEnd: '18:00',
  requireTrainerValidation: true,
  allowPublicOffers: true,
  notifyStudentsOnPublish: true,
  notifyTrainerOnPack: true,
  adminPhone: '+229 01 22 33 44',
  rooms: ADMIN_ROOMS.map((room) => room.label),
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) }
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

/** Paramètres établissement (persistés en session pour la démo). */
export function loadAdminSettings(): AdminEstablishmentSettings {
  const loaded = readJson(STORAGE_KEY, DEFAULT_SETTINGS)
  if (!Array.isArray(loaded.rooms) || loaded.rooms.length === 0) {
    return { ...loaded, rooms: [...DEFAULT_SETTINGS.rooms] }
  }
  return loaded
}

export function saveAdminSettings(settings: AdminEstablishmentSettings) {
  writeJson(STORAGE_KEY, settings)
}

export function getAdminSettingsDefaults(): AdminEstablishmentSettings {
  return {
    ...DEFAULT_SETTINGS,
    rooms: [...DEFAULT_SETTINGS.rooms],
  }
}

export function resetAdminSettings(): AdminEstablishmentSettings {
  const defaults = getAdminSettingsDefaults()
  saveAdminSettings(defaults)
  return defaults
}

/** Salles gérées dans Paramètres (utilisées à la proposition). */
export function listManagedAdminRooms(): AdminRoomOption[] {
  return loadAdminSettings().rooms.map((label, index) => ({
    id: `managed-room-${index}`,
    label,
  }))
}

export function arePublicOffersAllowed(): boolean {
  return loadAdminSettings().allowPublicOffers
}
