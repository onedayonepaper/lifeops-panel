import { type ReactNode } from 'react'

interface PageHeaderProps {
  icon: string
  title: string
  children?: ReactNode
}

export function PageHeader({ icon, title, children }: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h1>
      {children && (
        <div className="flex items-center gap-1 sm:gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
