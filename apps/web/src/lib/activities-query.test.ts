import { describe, expect, it } from 'vitest'

import {
  activitiesSearchSchema,
  nextActivitiesSearch,
} from './activities-query.ts'

const parse = (input: object) => activitiesSearchSchema.parse(input)

describe('activitiesSearchSchema', () => {
  it('keeps good values', () => {
    expect(
      parse({ status: 'draft', category: 'none', year: 2025, sort: 'oldest' }),
    ).toEqual({ status: 'draft', category: 'none', year: 2025, sort: 'oldest' })
  })
  it('drops hand-edited bad values instead of failing', () => {
    expect(
      parse({
        status: 'gone',
        category: 'x',
        year: 'abc',
        sort: 'up',
        page: 0,
      }),
    ).toEqual({})
  })
  it('adds nothing when the URL has nothing', () => {
    expect(parse({})).toEqual({})
  })
})

describe('nextActivitiesSearch', () => {
  it('drops empty keys and goes back to page 1 on a filter change', () => {
    expect(
      nextActivitiesSearch({ year: 2025, page: 3 }, { status: 'draft' }),
    ).toEqual({ year: 2025, status: 'draft' })
  })
  it('keeps a page asked for, but never writes page 1', () => {
    expect(nextActivitiesSearch({ q: 'ইফতার' }, { page: 2 })).toEqual({
      q: 'ইফতার',
      page: 2,
    })
    expect(nextActivitiesSearch({ page: 2 }, { page: 1 })).toEqual({})
  })
  it('clears a filter set to undefined', () => {
    expect(
      nextActivitiesSearch(
        { category: 'none', sort: 'oldest' },
        {
          category: undefined,
        },
      ),
    ).toEqual({ sort: 'oldest' })
  })
})
