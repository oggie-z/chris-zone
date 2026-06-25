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
