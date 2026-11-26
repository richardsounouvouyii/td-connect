import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAdminExtraSessions,
  mergeAdminSessionOverrides,
  proposePublicAdminSessions,
} from '@/features/dashboards/school-admin/lib/admin-sessions-store'
import { listAdminPlanningRows } from '@/features/dashboards/school-admin/lib/admin-planning-rows'
import { listTrainersForSubjectAndClass } from '@/features/dashboards/school-admin/mocks/admin-catalog'
import { listTrainerIdsWithExactSlot } from '@/features/dashboards/school-admin/mocks/admin-trainer-availability'
import { listTrainerAlerts } from '@/features/dashboards/trainer/lib/trainer-alert-reads'
import { acceptTrainerSession } from '@/features/dashboards/trainer/lib/session-decisions'

describe('proposition publique — smoke', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('Physique-Chimie + Terminale D + sam. 08:00–10:30 → Jean valide → Amina annulée', () => {
    const concerned = listTrainersForSubjectAndClass(
      'Physique-Chimie',
      'Terminale D',
    )
    expect(concerned.map((trainer) => trainer.fullName)).toEqual([
      'Jean Formateur',
      'Amina Koffi',
    ])

    const availableIds = listTrainerIdsWithExactSlot(
      concerned.map((trainer) => trainer.id),
      6,
      '08:00',
      '10:30',
    )
    expect(availableIds).toEqual(['user-trainer-1', 'user-trainer-2'])

    const sessions = proposePublicAdminSessions({
      trainerIds: availableIds,
      subject: 'Physique-Chimie',
      chapter: 'Mécanique — smoke',
      date: '2026-11-28',
      startTime: '08:00',
      endTime: '10:30',
      room: 'Labo 1',
      classLabel: 'Terminale D',
      groupLabel: 'TD Physique 1',
      pricing: 'PAID',
      priceCfa: 1500,
    })

    expect(sessions).toHaveLength(2)
    expect(sessions.every((session) => session.status === 'PENDING')).toBe(true)
    expect(sessions[0]?.offerGroupId).toBe(sessions[1]?.offerGroupId)

    const jeanNotifs = listTrainerAlerts('user-trainer-1').filter(
      (item) => item.kind === 'PROPOSAL_PENDING' && item.title === 'Proposition publique',
    )
    const aminaNotifs = listTrainerAlerts('user-trainer-2').filter(
      (item) => item.kind === 'PROPOSAL_PENDING' && item.title === 'Proposition publique',
    )
    expect(jeanNotifs.length).toBeGreaterThanOrEqual(1)
    expect(aminaNotifs.length).toBeGreaterThanOrEqual(1)

    const offerGroupId = sessions[0]!.offerGroupId!
    const planningBefore = listAdminPlanningRows('PENDING')
    const offerRow = planningBefore.find(
      (row) =>
        row.kind === 'publicOffer' && row.offerGroupId === offerGroupId,
    )
    expect(offerRow?.kind).toBe('publicOffer')
    if (offerRow?.kind === 'publicOffer') {
      expect(offerRow.trainerNames).toHaveLength(2)
      expect(offerRow.trainerNames).toEqual(
        expect.arrayContaining(['Jean Formateur', 'Amina Koffi']),
      )
      expect(offerRow.pendingCount).toBe(2)
    }

    const jeanSession = sessions.find(
      (session) => session.trainerId === 'user-trainer-1',
    )
    const aminaSession = sessions.find(
      (session) => session.trainerId === 'user-trainer-2',
    )
    expect(jeanSession).toBeTruthy()
    expect(aminaSession).toBeTruthy()

    const result = acceptTrainerSession(jeanSession!.id)
    expect(result.ok).toBe(true)

    const extras = getAdminExtraSessions().map(mergeAdminSessionOverrides)
    const jeanAfter = extras.find((session) => session.id === jeanSession!.id)
    const aminaAfter = extras.find((session) => session.id === aminaSession!.id)

    expect(jeanAfter?.status).toBe('PUBLISHED')
    expect(aminaAfter?.status).toBe('CANCELLED')
    expect(aminaAfter?.statusNote).toMatch(/déjà été validée par Jean Formateur/i)

    const planningAfter = listAdminPlanningRows('ALL').find(
      (row) =>
        row.kind === 'publicOffer' && row.offerGroupId === offerGroupId,
    )
    expect(planningAfter?.kind).toBe('publicOffer')
    if (planningAfter?.kind === 'publicOffer') {
      expect(planningAfter.status).toBe('PUBLISHED')
      expect(planningAfter.winnerName).toBe('Jean Formateur')
    }
  })
})
