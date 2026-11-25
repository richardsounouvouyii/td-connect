import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import { SchoolAdminLayout } from '@/app/layouts/SchoolAdminLayout'
import { StudentLayout } from '@/app/layouts/StudentLayout'
import { SuperAdminLayout } from '@/app/layouts/SuperAdminLayout'
import { TrainerLayout } from '@/app/layouts/TrainerLayout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { ForbiddenPage } from '@/features/auth/pages/ForbiddenPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { HomePage } from '@/features/dashboards/public/HomePage'
import { SchoolAdminHomePage } from '@/features/dashboards/school-admin/pages/SchoolAdminHomePage'
import { SectionPlaceholderPage } from '@/features/dashboards/shared/SectionPlaceholderPage'
import { StudentExamsPage } from '@/features/dashboards/student/pages/StudentExamsPage'
import { StudentHomePage } from '@/features/dashboards/student/pages/StudentHomePage'
import { StudentNotificationsPage } from '@/features/dashboards/student/pages/StudentNotificationsPage'
import { StudentPlanningPage } from '@/features/dashboards/student/pages/StudentPlanningPage'
import { StudentProfilePage } from '@/features/dashboards/student/pages/StudentProfilePage'
import { StudentSessionDetailPage } from '@/features/dashboards/student/pages/StudentSessionDetailPage'
import { SuperAdminHomePage } from '@/features/dashboards/super-admin/pages/SuperAdminHomePage'
import { TrainerHomePage } from '@/features/dashboards/trainer/pages/TrainerHomePage'

export function AppRouter() {
  return (
    <BrowserRouter>
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
            <Route path="disponibilites" element={<SectionPlaceholderPage />} />
            <Route path="seances" element={<SectionPlaceholderPage />} />
            <Route path="documents" element={<SectionPlaceholderPage />} />
            <Route path="notifications" element={<SectionPlaceholderPage />} />
            <Route path="profil" element={<SectionPlaceholderPage />} />
          </Route>
        </Route>

        <Route
          path="admin-etablissement"
          element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']} />}
        >
          <Route element={<SchoolAdminLayout />}>
            <Route index element={<SchoolAdminHomePage />} />
            <Route path="classes" element={<SectionPlaceholderPage />} />
            <Route path="planning" element={<SectionPlaceholderPage />} />
            <Route path="documents" element={<SectionPlaceholderPage />} />
            <Route path="parametres" element={<SectionPlaceholderPage />} />
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
