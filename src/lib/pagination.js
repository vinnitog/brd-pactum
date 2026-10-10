export const CARD_PAGE_SIZE = 24

export function paginateList(list, page = 1) {
  const pages = Math.max(1, Math.ceil(list.length / CARD_PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, page), pages)
  const start = (currentPage - 1) * CARD_PAGE_SIZE
  return { items: list.slice(start, start + CARD_PAGE_SIZE), currentPage, pages, total: list.length }
}
