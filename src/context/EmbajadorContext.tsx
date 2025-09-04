import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Embajador as EmbajadorModel } from '../model/Embajador'

type Ctx = {
  embajador: EmbajadorModel | null
  setEmbajador: (e: EmbajadorModel | null) => void
  logout: () => void
}

const EmbajadorContext = createContext<Ctx | undefined>(undefined)

export function EmbajadorProvider({ children }: { children: React.ReactNode }) {
  const [embajador, setEmb] = useState<EmbajadorModel | null>(() => {
    try {
      const raw = localStorage.getItem('embajador.actual')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  // keep in sync
  useEffect(() => {
    try {
      if (embajador) localStorage.setItem('embajador.actual', JSON.stringify(embajador))
      else localStorage.removeItem('embajador.actual')
    } catch {}
  }, [embajador])

  const value = useMemo<Ctx>(() => ({
    embajador,
    setEmbajador: (e) => {
        console.log("Setemba",e)
      setEmb(e)
      //if(e){
      //  localStorage.setItem('embajador.actual', JSON.stringify(embajador))
      //}
    },
    logout: () => {
        localStorage.removeItem('embajador.actual')
        setEmb(null)
    },
  }), [embajador])

  return <EmbajadorContext.Provider value={value}>{children}</EmbajadorContext.Provider>
}

export function useEmbajador() {
  const ctx = useContext(EmbajadorContext)
  if (!ctx) throw new Error('useEmbajador must be used within EmbajadorProvider')
  return ctx
}
