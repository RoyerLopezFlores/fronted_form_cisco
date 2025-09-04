import { Link, Route, Routes } from 'react-router-dom'
import { EmbajadorBadge } from './components/EmbajadorBadge'
import { useEmbajador } from './context/EmbajadorContext'
import LoginPage from './pages/LoginPage'
import CreateEmbajadorPage from './pages/CreateEmbajadorPage'
import EmbajadorPage from './pages/EmbajadorPage'
import ReplicaCreatePage from './pages/ReplicaCreatePage'
import ReplicaEditPage from './pages/ReplicaEditPage'
import RegistrosPage from './pages/RegistrosPage'

export default function App() {
  const { embajador } = useEmbajador()
  return (
    <div className="container">
      {embajador && (
        <>
          <EmbajadorBadge variant="card" />
          
        </>
        
      )}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create_embajador" element={<CreateEmbajadorPage />} />
        <Route path="/embajador" element={<EmbajadorPage />} />
        <Route path="/replica" element={<ReplicaCreatePage />} />
        <Route path="/replica/:id_replica" element={<ReplicaEditPage />} />
        <Route path="/registros/:id_replica" element={<RegistrosPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </div>
  )
}
