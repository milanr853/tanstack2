import './styles/index.scss';

import {
  Cell,
  Header,
} from '@tanstack/react-table';

import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import React, { CSSProperties, HTMLAttributes, HTMLProps } from 'react'

import './styles/index.scss'

import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,


  Column,
  getFilteredRowModel,
  getPaginationRowModel,
  Table,
  RowData,

  getSortedRowModel,
  SortingFn,
  SortingState,
} from '@tanstack/react-table'
import { makeData, Athlete } from './makeData'

// needed for table body level scope DnD setup
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,

} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

// needed for row & cell level scope DnD setup
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'


//////////////////////////////////////////
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

// Give our default column cell renderer editing superpowers!
const defaultColumn: Partial<ColumnDef<Athlete>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue()
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta?.updateData(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
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

function useSkipper() {
  const shouldSkipRef = React.useRef(true)
  const shouldSkip = shouldSkipRef.current

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = React.useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  React.useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
}
/////////////////////////////////////////


// Cell Component
const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  })
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button {...attributes} {...listeners}>
      🟰
    </button>
  )
}

// Row Component
const DraggableRow = ({ row }: { row: Row<Athlete> }) => {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.userId,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  }
  return (
    // connect row ref to dnd-kit, apply important styles
    <tr ref={setNodeRef} style={style}>
      {row.getVisibleCells().map(cell => (
        <td key={cell.id} style={{ width: cell.column.getSize() }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  )
}

const DraggableTableHeader = ({
  header,
  isPinned,
  onPinChange,
}: {
  header: Header<Athlete, unknown>;
  isPinned: boolean;
  onPinChange: (columnId: string, position: 'left' | 'none' | 'right') => void;
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
    padding: '0 8px',
    backgroundColor: isPinned ? '#d3d3d3' : 'transparent',
    position: isPinned ? 'sticky' : 'relative',
    left: isPinned ? '0' : 'auto',
    right: isPinned ? '0' : 'auto',
    borderRight: isPinned ? '2px solid gray' : 'none',
    boxSizing: 'border-box',
  };

  const handlePinChange = (position: 'left' | 'none' | 'right') => {
    console.log('position', position)
    console.log(header.column.id)
    onPinChange(header.column.id, position);
  };

  return (
    <th
      colSpan={header.colSpan}
      ref={setNodeRef}
      style={style}
    >
      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
      <button {...attributes} {...listeners} style={{ marginLeft: '4px' }}>
        🟰
      </button>
      <div style={{ marginTop: '4px' }}>
        <button onClick={() => handlePinChange('left')} style={{ marginRight: '8px' }}>Pin</button>
        <button onClick={() => handlePinChange('none')}>Unpin</button>
        {/* <button onClick={() => handlePinChange('right')} style={{ marginLeft: '8px' }}>Pin Right</button> */}
      </div>
    </th>
  );
};


const DragAlongCell = ({ cell }: { cell: Cell<Athlete, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
    padding: '0 8px',
  };

  return (
    <td style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
};

//custom sorting logic for one of our enum columns
const sortSportFn: SortingFn<Athlete> = (rowA, rowB, _columnId) => {
  const sportA = rowA.original.sport;
  const sportB = rowB.original.sport;

  // Compare the sport values alphabetically
  return sportA.localeCompare(sportB);
};

function Filter({
  column,
  table,
}: {
  column: Column<any, any>
  table: Table<any>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2">
      <input
        type="number"
        value={((column.getFilterValue() as any)?.[0] ?? '') as string}
        onChange={e =>
          column.setFilterValue((old: any) => [e.target.value, old?.[1]])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={((column.getFilterValue() as any)?.[1] ?? '') as string}
        onChange={e =>
          column.setFilterValue((old: any) => [old?.[0], e.target.value])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      type="text"
      value={(column.getFilterValue() ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
    />
  )
}


function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!)

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}


// Table Component
function App() {
  /////////////////////////////////////////////////////
  // sorting
  // editable (remove ceil)
  // footer: pagination
  // checkbox | row selection
  // row DnD
  // filter
  const columns = React.useMemo<ColumnDef<Athlete>[]>(
    () => [
      //row drag
      {
        id: 'drag-handle',
        header: 'Move',
        cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
        size: 60,
      },
      // checkbox | row selection
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
        accessorKey: 'name',
        header: () => <span>Name</span>,
        footer: props => props.column.id,
        // cell: info => info.getValue(),
        // Sorting for 'name' will be ascending by default (string column)
      },
      {
        accessorFn: row => row.country,
        id: 'country',
        // cell: info => info.getValue(),
        header: () => <span>Country</span>,
        sortUndefined: 'last', // Force undefined values to the end
        sortDescFirst: false, // First sort order will be ascending
        footer: props => props.column.id,
        size: 150,
      },
      {
        accessorKey: 'age',
        header: () => 'Age',
        id: 'age',
        size: 80,
        footer: props => props.column.id,
        // Sorting for 'age' will be descending by default (number column)
      },
      {
        accessorKey: 'year',
        header: () => <span>Year</span>,
        sortUndefined: 'last', // Force undefined values to the end
        footer: props => props.column.id,
        id: 'year',
        size: 100,
      },
      {
        accessorKey: 'sport',
        header: 'Sport',
        sortingFn: sortSportFn, // Custom sorting function if needed
        footer: props => props.column.id,
        id: 'sport',
        size: 150,
      },
      {
        accessorKey: 'totalMedals',
        header: 'Total Medals',
        footer: props => props.column.id,
        id: 'totalMedals',
        size: 120,
        // enableSorting: false, // Uncomment to disable sorting for this column
      },
      {
        accessorKey: 'date',
        header: 'Date',
        footer: props => props.column.id,
        id: 'date',
        size: 150,
        invertSorting: true, // Invert sorting order if needed (smaller is better)
      },
      {
        accessorKey: 'userId',
        header: 'User ID',
        // Implement custom sorting if needed (generally unique IDs are not sorted)
      },
    ],
    []
  );

  // Dnd n Pin
  // const columns = React.useMemo<ColumnDef<Athlete>[]>(
  //   () => [
  //     {
  //       accessorKey: 'name',
  //       cell: info => info.getValue(),
  //       header: 'Athlete Name',
  //       id: 'name',
  //       size: 200,
  //     },
  //     {
  //       accessorKey: 'age',
  //       cell: info => info.getValue(),
  //       // header: 'Age',
  //       header: () => 'Age',
  //       id: 'age',
  //       size: 80,
  //     },
  //     {
  //       accessorKey: 'country',
  //       accessorFn: row => row.country,
  //       cell: info => info.getValue(),
  //       // header: 'Country',
  //       header: () => <span>Country</span>,
  //       id: 'country',
  //       size: 150,
  //       sortUndefined: 'last', // Force undefined values to the end
  //       sortDescFirst: false, // First sort order will be ascending
  //     },
  //     {
  //       accessorKey: 'year',
  //       cell: info => info.getValue(),
  //       // header: 'Year',
  //       header: () => <span>Year</span>,
  //       sortUndefined: 'last', // Force undefined values to the end
  //       id: 'year',
  //       size: 100,
  //     },
  //     {
  //       accessorKey: 'date',
  //       cell: info => info.getValue(),
  //       header: 'Date',
  //       id: 'date',
  //       size: 150,
  //       invertSorting: true,
  //     },
  //     {
  //       accessorKey: 'sport',
  //       cell: info => info.getValue(),
  //       header: 'Sport',
  //       id: 'sport',
  //       size: 150,
  //       sortingFn: sortSportFn,
  //     },
  //     {
  //       accessorKey: 'totalMedals',
  //       cell: info => info.getValue(),
  //       header: 'Total Medals',
  //       id: 'totalMedals',
  //       size: 120,
  //     },
  //   ],
  //   []
  // );



  ////////////////////////////////////////////////////
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  const [sorting, setSorting] = React.useState<SortingState>([])

  const [data, setData] = React.useState(() => makeData(50))

  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map(c => c.id!)
  );

  const [pinnedColumnsState, setPinnedColumnsState] = React.useState({
    // left: ['name'],
    left: [''],
    right: ['totalMedals']
  });

  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ userId }) => userId),
    [data]
  )

  const rerender = () => setData(() => makeData(20))

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.userId, //required because row indexes will change
    state: {
      columnOrder, rowSelection, sorting
    },
    onColumnOrderChange: setColumnOrder,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,

    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    onRowSelectionChange: setRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

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
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
  })

  // reorder rows after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData(data => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex) //this is just a splice util
      })

      setColumnOrder(columnOrder => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  const handlePinChange = (columnId: string, position: 'left' | 'none' | 'right') => {
    setPinnedColumnsState(prev => {
      const newPinned = { ...prev };
      if (position === 'left') {
        newPinned.left = [...newPinned.left, columnId];
        newPinned.right = newPinned.right.filter(id => id !== columnId);
      } else {
        newPinned.left = newPinned.left.filter(id => id !== columnId);
        newPinned.right = newPinned.right.filter(id => id !== columnId);
      }
      return newPinned;
    });
  };

  // Determine which columns are pinned and which are not
  const pinnedColumns = [
    ...pinnedColumnsState.left,
    ...pinnedColumnsState.right,
  ];
  const nonPinnedColumns = columnOrder.filter(
    id => !pinnedColumns.includes(id)
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  //sorting
  //pagination
  //row selection
  //editable 
  //row DnD
  //column filtering
  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="p-2">
        {/* Global Search */}
        <div>
          <input
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="p-2 font-lg shadow border border-block"
            placeholder="Search all columns..."
          />
        </div>

        <div className="h-2" />

        {/* Table */}
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                          title={
                            header.column.getCanSort()
                              ? header.column.getNextSortingOrder() === 'asc'
                                ? 'Sort ascending'
                                : header.column.getNextSortingOrder() === 'desc'
                                  ? 'Sort descending'
                                  : 'Clear sort'
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                        {header.column.getCanFilter() ? (
                          <div>
                            <Filter column={header.column} table={table} />
                          </div>
                        ) : null}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            <SortableContext
              items={table.getRowModel().rows.map(row => row.id)} // Ensures rows are sortable
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows.map(row => (
                <DraggableRow key={row.id} row={row} />
              ))}
            </SortableContext>
          </tbody>

          <tfoot>
            <tr>
              <td className="p-1">
                <IndeterminateCheckbox
                  {...{
                    checked: table.getIsAllPageRowsSelected(),
                    indeterminate: table.getIsSomePageRowsSelected(),
                    onChange: table.getToggleAllPageRowsSelectedHandler(),
                  }}
                />
              </td>
              <td colSpan={20}>Page Rows ({table.getRowModel().rows.length})</td>
            </tr>
          </tfoot>
        </table>

        <div className="h-2" />

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            | Go to page:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 rounded w-16"
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>

        <br />

        {/* Row Selection */}
        <div>
          {Object.keys(rowSelection).length} of{' '}
          {table.getPreFilteredRowModel().rows.length} Total Rows Selected
        </div>
        <hr />
        <br />
        <div>
          <label>Row Selection State:</label>
          <pre>{JSON.stringify(table.getState().rowSelection, null, 2)}</pre>
        </div>
      </div>
    </DndContext>
  );



  ///column Dnd n Pin
  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="p-2">
        <div className="h-4" />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => rerender()} className="border p-1">
            Regenerate
          </button>
        </div>
        <div className="h-4" />
        <div style={{ width: '85%', height: '500px', overflow: 'auto' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', flexShrink: 0 }}>
              <table style={{ width: '100%' }}>
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers
                        .filter(header => pinnedColumnsState.left.includes(header.id))
                        .map(header => (
                          <DraggableTableHeader
                            key={header.id}
                            header={header}
                            isPinned={pinnedColumnsState.left.includes(header.id)}
                            onPinChange={handlePinChange}
                          />
                        ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells()
                        .filter(cell => pinnedColumnsState.left.includes(cell.column.id))
                        .map(cell => (
                          <DragAlongCell key={cell.id} cell={cell} />
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ overflowX: 'auto', flexGrow: 1 }}>
              <table style={{ width: '100%' }}>
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      <SortableContext
                        items={nonPinnedColumns}
                        strategy={horizontalListSortingStrategy}
                      >
                        {headerGroup.headers
                          .filter(header => !pinnedColumnsState.left.includes(header.id))
                          .map(header => (
                            <DraggableTableHeader
                              key={header.id}
                              header={header}
                              isPinned={false}
                              onPinChange={handlePinChange}
                            />
                          ))}
                      </SortableContext>
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells()
                        .filter(cell => !pinnedColumnsState.left.includes(cell.column.id))
                        .map(cell => (
                          <SortableContext
                            key={cell.id}
                            items={nonPinnedColumns}
                            strategy={horizontalListSortingStrategy}
                          >
                            <DragAlongCell key={cell.id} cell={cell} />
                          </SortableContext>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </DndContext>
  );
}


export default App