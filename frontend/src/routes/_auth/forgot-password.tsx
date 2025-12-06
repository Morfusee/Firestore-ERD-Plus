import ForgotPasswordPage from '@/pages/forgot-password'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/forgot-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ForgotPasswordPage />
}
