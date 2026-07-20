import { AppLayout } from '@/app/layouts/AppLayout'
import { mentorAppNavLinks } from '@/constants/nav'

export function MentorAppLayout() {
  return <AppLayout links={mentorAppNavLinks} />
}
