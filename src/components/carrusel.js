import React from 'react'
import { CCarousel, CCarouselItem, CImage } from '@coreui/react'

const Carrusell = () => {
  return (
    <CCarousel controls indicators>
      <CCarouselItem>
        <CImage className="d-block w-100" src={'/src/assets/images/angular.jpg'} alt="slide 1" />
      </CCarouselItem>
      <CCarouselItem>
        <CImage className="d-block w-100" src={'/src/assets//images/components.webp'} alt="slide 2" />
      </CCarouselItem>
      <CCarouselItem>
        <CImage className="d-block w-100" src={'/src/assets//images/react.jpg'} alt="slide 3" />
      </CCarouselItem>
    </CCarousel>
  )
}

export default Carrusell;
