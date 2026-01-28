import { useState } from 'react'
import PlayerCustomization from './jsx/playerCustomization.jsx'
import './App.css'

function App() {
  const [page, setPage] = useState("playerCustomization");
  switch(page) {
    case "playerCustomization":
      return (<PlayerCustomization></PlayerCustomization>)
  }
  return (
    <>
      
    </>
  )
}

export default App
