import { render } from 'preact'

import IndexPage from './page'
import '../../index.css'

let root = document.getElementById('root')
if (root == null) {
  root = document.createElement('main')
  root.id = 'root'
}

render(
  <IndexPage />,
  root
)
