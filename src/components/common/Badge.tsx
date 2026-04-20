import type { ReactNode } from 'react'

type Variant = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple'

const variantClass: Record<Variant, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-brand-100 text-brand-700',
}

interface Props {
  variant?: Variant
  children: ReactNode
}

export function Badge({ variant = 'gray', children }: Props) {
  return (
    <span className={`badge ${variantClass[variant]}`}>{children}</span>
  )
}

export function statusBadge(status: string) {
  switch (status) {
    case 'active': return <Badge variant="green">販売中</Badge>
    case 'inactive': return <Badge variant="yellow">停止中</Badge>
    case 'draft': return <Badge variant="gray">下書き</Badge>
    case 'discontinued': return <Badge variant="red">廃番</Badge>
    default: return <Badge>{status}</Badge>
  }
}
