export interface Project {
  id: string
  icon: string
  name: string
  desc: string
  tech: string[]
  url?: string
}

export const PROJECTS: Project[] = [
  {
    id: 'so-alerts',
    icon: '⚡',
    name: 'SO Alerts',
    desc: 'Kotlin CLI for monitoring So Energy systems — webhook alerts, SLA polling, and first response tracking. Auto-starts and runs in the background.',
    tech: ['Kotlin', 'Ktor', 'CLI', 'Webhooks'],
  },
  {
    id: 'jira-triage',
    icon: '📋',
    name: 'Jira Triage',
    desc: 'Live dashboard and triage tool for SISD Jira queues. Manages my queue, incidents, and unassigned tickets with real-time updates.',
    tech: ['Kotlin', 'Jira API', 'CLI'],
  },
  {
    id: 'adorned',
    icon: '👗',
    name: 'Adorned Couture',
    desc: 'Full e-commerce site at adornedcouture.com — auth, product management, payments, and order tracking. Live and taking orders!',
    tech: ['Next.js', 'Vercel', 'Stripe', 'TypeScript'],
    url: 'https://adornedcouture.com',
  },
  {
    id: 'joule',
    icon: '⚙️',
    name: 'Joule',
    desc: 'Personal Kotlin/Ktor learning project mirroring the So Energy backend stack. A sandbox for practising clean architecture and domain-driven design.',
    tech: ['Kotlin', 'Ktor', 'PostgreSQL', 'Koin'],
  },
  {
    id: 'wachat',
    icon: '💬',
    name: 'WhatsApp Clone',
    desc: 'Real-time chat app workshop starter. WebSocket messaging, Google auth, and a full MSW mock layer so the UI works with no backend running.',
    tech: ['React 19', 'TypeScript', 'WebSocket', 'TanStack'],
  },
]
