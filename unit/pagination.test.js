import test from 'node:test'
import assert from 'node:assert/strict'
import { paginateList } from '../src/lib/pagination.js'

test('paginação preserva ordem/referências e não remove dados, incluindo fronteiras', () => {
  const list = Array.from({ length: 1000 }, (_, id) => ({ id }))
  const pages = Array.from({ length: 42 }, (_, i) => paginateList(list, i + 1).items).flat()
  assert.deepEqual(pages, list)
  assert.equal(pages[500], list[500])
  assert.equal(list.length, 1000)
  assert.equal(paginateList(list, 100).currentPage, 42)
  assert.equal(paginateList([], 9).currentPage, 1)
  assert.deepEqual(paginateList([], 9).items, [])
})
