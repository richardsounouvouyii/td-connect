import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ScrollToTop } from '@/components/navigation/shared/ScrollToTop'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import { SchoolAdminLayout } from '@/app/layouts/SchoolAdminLayout'
import { StudentLayout } from '@/app/layouts/StudentLayout'
import { SuperAdminLayout } from '@/app/layouts/SuperAdminLayout'
import { TrainerLayout } from '@/app/layouts/TrainerLayout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { ForbiddenPage } from '@/features/auth/pages/ForbiddenPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { HomePage } from '@/features/dashboards/public/HomePage'
import { SchoolAdminClassDetailPage } from '@/features/dashboards/school-admin/pages/SchoolAdminClassDetailPage'
import { SchoolAdminClassesPage } from '@/features/dashboards/school-admin/pages/SchoolAdminClassesPage'
import { SchoolAdminDocumentsPage } from '@/features/dashboards/school-admin/pages/SchoolAdminDocumentsPage'
import { SchoolAdminHomePage } from '@/features/dashboards/school-admin/pages/SchoolAdminHomePage'
import { SchoolAdminSettingsPage } from '@/features/dashboards/school-admin/pages/SchoolAdminSettingsPage'
import { SchoolAdminPlanningPage } from '@/features/dashboards/school-admin/pages/SchoolAdminPlanningPage'
import { SchoolAdminProposeSessionPage } from '@/features/dashboards/school-admin/pages/SchoolAdminProposeSessionPage'
import { SchoolAdminSessionDetailPage } from '@/features/dashboards/school-admin/pages/SchoolAdminSessionDetailPage'
import { SectionPlaceholderPage } from '@/features/dashboards/shared/SectionPlaceholderPage'
import { StudentExamsPage } from '@/features/dashboards/student/pages/StudentExamsPage'
import { StudentHomePage } from '@/features/dashboards/student/pages/StudentHomePage'
import { StudentNotificationsPage } from '@/features/dashboards/student/pages/StudentNotificationsPage'
import { StudentPlanningPage } from '@/features/dashboards/student/pages/StudentPlanningPage'
import { StudentProfilePage } from '@/features/dashboards/student/pages/StudentProfilePage'
import { StudentSessionDetailPage } from '@/features/dashboards/student/pages/StudentSessionDetailPage'
import { SuperAdminHomePage } from '@/features/dashboards/super-admin/pages/SuperAdminHomePage'
import { TrainerAvailabilityPage } from '@/features/dashboards/trainer/pages/TrainerAvailabilityPage'
import { TrainerDocumentsPage } from '@/features/dashboards/trainer/pages/TrainerDocumentsPage'
import { TrainerHomePage } from '@/features/dashboards/trainer/pages/TrainerHomePage'
import { TrainerNotificationsPage } from '@/features/dashboards/trainer/pages/TrainerNotificationsPage'
import { TrainerProfilePage } from '@/features/dashboards/trainer/pages/TrainerProfilePage'
import { TrainerSessionDetailPage } from '@/features/dashboards/trainer/pages/TrainerSessionDetailPage'
import { TrainerSessionsPage } from '@/features/dashboards/trainer/pages/TrainerSessionsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="connexion" element={<LoginPage />} />
          <Route path="acces-refuse" element={<ForbiddenPage />} />
        </Route>

        <Route
          path="eleve"
          element={<ProtectedRoute allowedRoles={['STUDENT']} />}
        >
          <Route element={<StudentLayout />}>
            <Route index element={<StudentHomePage />} />
            <Route path="planning" element={<StudentPlanningPage />} />
            <Route
              path="planning/:sessionId"
              element={<StudentSessionDetailPage />}
            />
            <Route path="epreuves" element={<StudentExamsPage />} />
            <Route
              path="notifications"
              element={<StudentNotificationsPage />}
            />
            <Route path="profil" element={<StudentProfilePage />} />
          </Route>
        </Route>

        <Route
          path="formateur"
          element={<ProtectedRoute allowedRoles={['TRAINER']} />}
        >
          <Route element={<TrainerLayout />}>
            <Route index element={<TrainerHomePage />} />
            <Route
              path="disponibilites"
              element={<TrainerAvailabilityPage />}
            />
            <Route path="seances" element={<TrainerSessionsPage />} />
            <Route
              path="seances/:sessionId"
              element={<TrainerSessionDetailPage />}
            />
            <Route path="documents" element={<TrainerDocumentsPage />} />
            <Route
              path="notifications"
              element={<TrainerNotificationsPage />}
            />
            <Route path="profil" element={<TrainerProfilePage />} />
          </Route>
        </Route>

        <Route
          path="admin-etablissement"
          element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']} />}
        >
          <Route element={<SchoolAdminLayout />}>
            <Route index element={<SchoolAdminHomePage />} />
            <Route path="classes" element={<SchoolAdminClassesPage />} />
            <Route
              path="classes/:classId"
              element={<SchoolAdminClassDetailPage />}
            />
            <Route path="planning" element={<SchoolAdminPlanningPage />} />
            <Route
              path="planning/nouvelle"
              element={<SchoolAdminProposeSessionPage />}
            />
            <Route
              path="planning/:sessionId"
              element={<SchoolAdminSessionDetailPage />}
            />
            <Route path="documents" element={<SchoolAdminDocumentsPage />} />
            <Route path="parametres" element={<SchoolAdminSettingsPage />} />
          </Route>
        </Route>

        <Route
          path="super-admin"
          element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}
        >
          <Route element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminHomePage />} />
            <Route path="etablissements" element={<SectionPlaceholderPage />} />
            <Route path="comptes" element={<SectionPlaceholderPage />} />
            <Route path="parametres" element={<SectionPlaceholderPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
