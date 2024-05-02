
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Game from './pages/Game'

function App() {

  return (
    <div className='min-h-screen'>
      <Routers />
    </div>
  )
}

function Routers() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game/:gameId" element={<Game />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
