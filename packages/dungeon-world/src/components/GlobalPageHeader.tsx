import React from 'react'
import './GlobalPageHeader.css'

interface GlobalPageHeaderProps {
  title: string
  subtitle?: string
}

const GlobalPageHeader: React.FC<GlobalPageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="page-header">
      <div className="page-header__inner">
        <div className="page-header__text">
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <span className="page-header__subtitle">{subtitle}</span>}
        </div>
      </div>
    </div>
  )
}

export default GlobalPageHeader


