import * as Imports from '../imports/import';

import { } from "@tanstack/react-table"



function useSkipper() {
  const shouldSkipRef = Imports.React.useRef(true)
  const shouldSkip = shouldSkipRef.current

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = Imports.React.useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  Imports.React.useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
}

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: Imports.FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = Imports.rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank,
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

// Define a custom fuzzy sort function that will sort by rank if the row has ranking information
const fuzzySort: Imports.SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = Imports.compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!
    )
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? Imports.sortingFns.alphanumeric(rowA, rowB, columnId) : dir
}

export { fuzzyFilter, fuzzySort, useSkipper }