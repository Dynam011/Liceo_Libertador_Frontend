import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4" style={{ background: '#114c5f', color: 'white' }}>
      <div>
        <span className="ms-1">&copy; 2025 UNEFA.</span>
      </div>
      <div className="text-secondary " style={{ fontStyle: 'italic', fontSize: 15 }}>
        
      <span style={{color: 'white' }}>"Educación de calidad, conocimiento sin límites"</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
