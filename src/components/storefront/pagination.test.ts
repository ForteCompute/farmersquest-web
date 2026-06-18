import { describe, expect, it } from 'vitest';
import { pageList } from './paginate';

describe('pageList', () => {
  it('lists every page when there are few', () => {
    expect(pageList(1, 3)).toEqual([1, 2, 3]);
  });

  it('always includes first, last, and current with gaps between', () => {
    expect(pageList(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10]);
  });

  it('does not insert a gap when pages are adjacent', () => {
    expect(pageList(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('handles the first and last page without leading or trailing gaps', () => {
    expect(pageList(1, 6)).toEqual([1, 2, 'gap', 6]);
    expect(pageList(6, 6)).toEqual([1, 'gap', 5, 6]);
  });
});
