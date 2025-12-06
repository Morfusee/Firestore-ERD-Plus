import Register from '@/pages/register'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Register />
}
