import { BookOpen, FileSearch, GraduationCap, Home, Menu, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/cuestionario', label: 'Cuestionario', icon: BookOpen },
  { to: '/no-ofertadas', label: 'No ofertadas', icon: FileSearch },
  { to: '/fuentes', label: 'Fuentes', icon: GraduationCap },
]

export const Navbar = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav aria-label="Navegación principal" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" to="/">
          <img
            alt="Logo Universidad Distrital Francisco José de Caldas"
            className="h-10 w-auto"
            src="https://www.udistrital.edu.co/admisiones/themes/custom/versh/logo.png"
          />
          <span className="hidden border-l border-zinc-200 pl-3 text-sm font-bold text-zinc-900 sm:block">APOYO vocacional</span>
        </Link>

        <button
          aria-expanded={open}
          aria-label={open ? 'Cerrar navegación' : 'Abrir navegación'}
          className="inline-flex items-center justify-center rounded-md border border-zinc-300 p-2 text-zinc-800 md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                  isActive ? 'bg-red-700 text-white' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                }`
              }
              key={to}
              to={to}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <NavLink
            className="ml-2 inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            to="/resultados"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Resultados
          </NavLink>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-zinc-200 bg-white px-4 py-3 md:hidden">
          <div className="grid gap-2">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-red-700 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                  }`
                }
                key={to}
                onClick={() => setOpen(false)}
                to={to}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}
