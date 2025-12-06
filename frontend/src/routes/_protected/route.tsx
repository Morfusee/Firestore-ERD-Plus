import FirestoreERD from '@/pages/FirestoreERD'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FirestoreERD />
}
