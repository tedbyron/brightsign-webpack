import { StrictMode } from 'react'
import { render } from 'react-dom'

import IndexPage from './page'
import '../../index.css'

render(
  <StrictMode>
    <IndexPage />
  </StrictMode>,
  document.getElementById('root')
)
