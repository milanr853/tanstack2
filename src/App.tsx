import "./index.css"

import * as Imports from './imports/import';  // Import everything from imports.ts

import { Person, makeData } from "./makeData"
import Pagination from './components/Pagination'
import MasterTable from './components/MasterTable'
import { useGlobalFilter } from './context/GlobalFilterContext'; // Import the custom hook
import { fuzzyFilter, fuzzySort, useSkipper } from './functions/helperFunctions'
import { IndeterminateCheckbox } from "./components/InterminateCheckbox";
import { dataApi } from "./api/api";
import Loader from "./components/Loader";
import AdditionalFeatures from "./components/AdditionalFeatureWrapper";
import DragBtn from "./components/DragBtn";


declare module '@tanstack/react-table' {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends Imports.RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }

  interface FilterMeta {
    itemRank: Imports.RankingInfo
  }

  interface TableMeta<TData extends Imports.RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

// Give our default column cell renderer editing superpowers!
const defaultColumn: Partial<Imports.ColumnDef<Person>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue()
    // We need to keep and update the state of the cell normally
    const [value, setValue] = Imports.React.useState(initialValue)

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta?.updateData(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    Imports.React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    return (
      <input
        value={value as string}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
      />
    )
  },
}

// Cell Component
const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = Imports.useSortable({
    id: rowId,
  })
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <DragBtn attributes={attributes} listeners={listeners} />
  )
}


function App() {
  const columns = Imports.React.useMemo<Imports.ColumnDef<Person, any>[]>(
    () => [
      {
        id: 'drag-handle',
        header: 'Move',
        cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
        size: 60,
      },

      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },

      {
        accessorKey: 'firstName',
        id: 'firstName',
        header: () => <span>First Name</span>,
        meta: {
          filterVariant: 'text',
        },
      },
      {
        accessorKey: 'lastName',
        id: 'lastName',
        header: () => <span>Last Name</span>,
        meta: {
          filterVariant: 'text',
        },
      },
      {
        accessorKey: 'fullName',
        accessorFn: row => `${row.firstName} ${row.lastName}`,
        id: 'fullName',
        header: () => <span>Full Name</span>,
        meta: {
          filterVariant: 'text',
        },
        sortingFn: fuzzySort, //sort by fuzzy rank (falls back to alphanumeric)
      },
      {
        accessorKey: 'age',
        id: 'age',
        header: () => 'Age',
        meta: {
          filterVariant: 'range',
        },
      },
      {
        accessorKey: 'visits',
        header: () => <span>Visits</span>,
        id: "visits",
        meta: {
          filterVariant: 'range',
        },
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: () => <span>Status</span>,
        meta: {
          filterVariant: 'select',
        },
      },
      {
        accessorKey: 'progress',
        id: 'progress',
        header: () => <span>Profile Progress</span>,
        meta: {
          filterVariant: 'range',
        },
      },
    ],
    []
  )

  const [data, setData] = Imports.React.useState(() => makeData(50))
  const [columnFilters, setColumnFilters] = Imports.React.useState<Imports.ColumnFiltersState>([])
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
  const [sorting, setSorting] = Imports.React.useState<Imports.SortingState>([])
  const [rowSelection, setRowSelection] = Imports.React.useState({})
  const [columnOrder, setColumnOrder] = Imports.React.useState<string[]>(() => columns.map(c => c.id!))
  const [columnPinning, setColumnPinning] = Imports.React.useState({})
  const [isSplit, setIsSplit] = Imports.React.useState(false)
  const [fetchedData, setFetchedData] = Imports.React.useState<any>(null)

  const { globalFilter, setGlobalFilter } = useGlobalFilter(); // Use the custom hook


  //table schema
  const table = Imports.useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      columnFilters,
      globalFilter,
      sorting,
      rowSelection,
      columnOrder,
      columnPinning,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: Imports.getCoreRowModel(),
    getFilteredRowModel: Imports.getFilteredRowModel(), //client side filtering
    getSortedRowModel: Imports.getSortedRowModel(),
    getPaginationRowModel: Imports.getPaginationRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
    onGlobalFilterChange: setGlobalFilter,

    defaultColumn,
    autoResetPageIndex,
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex()
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              }
            }
            return row
          })
        )
      },
    },

    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access

    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    getRowId: row => row.id, //required because row indexes will change
  })

  //functions
  async function getData() {
    const data: any = await dataApi
    setFetchedData(data)
  }

  Imports.React.useEffect(() => {
    getData()
  }, [])

  //apply the fuzzy sort if the fullName column is being filtered
  Imports.React.useEffect(() => {
    if (table.getState().columnFilters[0]?.id === 'fullName') {
      if (table.getState().sorting[0]?.id !== 'fullName') {
        table.setSorting([{ id: 'fullName', desc: false }])
      }
    }
  }, [table.getState().columnFilters[0]?.id])



  return (
    fetchedData ?
      <div className="bg-purple-200 h-screen p-8 flex flex-col justify-center">

        <AdditionalFeatures data={data} />

        <MasterTable
          table={table}
          columnOrder={columnOrder} setColumnOrder={setColumnOrder}
          data={data} setData={setData} />

        <Pagination
          table={table}
          position={fetchedData?.position}
        />
      </div>

      :

      <Loader />
  )
}

export default App