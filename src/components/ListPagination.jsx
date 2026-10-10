import { Button } from './ui/index.jsx'

export default function ListPagination({ currentPage, pages, total, onPageChange, label }) {
  if (pages <= 1) return null
  return (
    <nav aria-label={label} className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <Button type="button" variant="ghost" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Página anterior</Button>
      <span role="status" className="text-sm text-muted">Página {currentPage} de {pages} · {total} registros</span>
      <Button type="button" variant="ghost" disabled={currentPage === pages} onClick={() => onPageChange(currentPage + 1)}>Próxima página</Button>
    </nav>
  )
}
