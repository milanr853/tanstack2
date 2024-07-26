// Features [row sorting, column filter, pagination, editable, row-selection]

// Advance feature [row-dnd, colum-dnd, column-pinning]

// Extra [Column Visibility, Expanding]

import * as Imports from '../imports/import';
import { Person } from '../makeData';
import DebouncedInput from './DebouncedInput'


function Filter({ column }: { column: Imports.Column<any, unknown> }) {
    const columnFilterValue = column.getFilterValue()
    const { filterVariant } = column.columnDef.meta ?? {}

    return filterVariant === 'range' ? (
        <div>
            <div className="flex space-x-2">
                <DebouncedInput
                    type="number"
                    value={(columnFilterValue as [number, number])?.[0] ?? ''}
                    onChange={value =>
                        column.setFilterValue((old: [number, number]) => [value, old?.[1]])
                    }
                    placeholder={`Min`}
                    className="w-24 border shadow rounded"
                />
                <DebouncedInput
                    type="number"
                    value={(columnFilterValue as [number, number])?.[1] ?? ''}
                    onChange={value =>
                        column.setFilterValue((old: [number, number]) => [old?.[0], value])
                    }
                    placeholder={`Max`}
                    className="w-24 border shadow rounded"
                />
            </div>
            <div className="h-1" />
        </div>
    ) : filterVariant === 'select' ? (
        <select
            onChange={e => column.setFilterValue(e.target.value)}
            value={columnFilterValue?.toString()}
        >
            <option value="">All</option>
            <option value="complicated">complicated</option>
            <option value="relationship">relationship</option>
            <option value="single">single</option>
        </select>
    ) : (
        <DebouncedInput
            className="w-36 border shadow rounded"
            onChange={value => column.setFilterValue(value)}
            placeholder={`Search...`}
            type="text"
            value={(columnFilterValue ?? '') as string}
        />
    )
}

const DraggableTableHeader = ({
    header,
}: {
    header: Imports.Header<Person, unknown>
}) => {
    const { attributes, isDragging, listeners, setNodeRef, transform } =
        Imports.useSortable({
            id: header.column.id,
        })

    const style: Imports.CSSProperties = {
        opacity: isDragging ? 0.8 : 1,
        position: 'relative',
        transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)` // Example of manual transform construction
            : undefined,
        transition: 'width transform 0.2s ease-in-out',
        whiteSpace: 'nowrap',
        width: header.column.getSize(),
        zIndex: isDragging ? 1 : 0,
    }

    return (
        <th key={header.id} colSpan={header.colSpan} ref={setNodeRef} style={style}>
            {header.isPlaceholder ? null : (
                <>
                    <div
                        {...{
                            className: header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : '',
                            onClick: header.column.getToggleSortingHandler(),
                        }}
                    >
                        {Imports.flexRender(
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
                            <Filter column={header.column} />
                        </div>
                    ) : null}
                </>
            )}
            <button {...attributes} {...listeners}>
                🟰
            </button>
        </th>

    )
}

const DragAlongCell = ({ cell }: { cell: Imports.Cell<Person, unknown> }) => {
    const { isDragging, setNodeRef, transform } = Imports.useSortable({
        id: cell.column.id,
    })

    const style: Imports.CSSProperties = {
        opacity: isDragging ? 0.8 : 1,
        position: 'relative',
        transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)` // Example of manual transform construction
            : undefined,
        transition: 'width transform 0.2s ease-in-out',
        width: cell.column.getSize(),
        zIndex: isDragging ? 1 : 0,
    }

    return (
        // <td style={style} ref={setNodeRef}>
        //   {Imports.flexRender(cell.column.columnDef.cell, cell.getContext())}
        // </td>

        <td key={cell.id} style={style} ref={setNodeRef}>
            {Imports.flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
            )}
        </td>
    )
}

// Row Component
const DraggableRow = ({ row }: { row: Imports.Row<Person> }) => {
    const { transform, transition, setNodeRef, isDragging } = Imports.useSortable({
        id: row.original?.id,
    })

    const style: Imports.CSSProperties = {
        transform: Imports.CSS.Transform.toString(transform), //let dnd-kit do its thing
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
                    {Imports.flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))}
        </tr>
    )
}



function MasterTable({ table, columnOrder, setColumnOrder, data, setData }: any) {

    const dataIds = Imports.React.useMemo<Imports.UniqueIdentifier[]>(() => data?.map(({ id }: any) => id), [data])


    // reorder columns after drag & drop
    function handleDragEnd(event: Imports.DragEndEvent) {
        const { active, over } = event
        console.log({ active, over, event })
        // if (active && over && active.id !== over.id) {
        //     setColumnOrder((columnOrder: any) => {
        //         const oldIndex = columnOrder.indexOf(active.id as string)
        //         const newIndex = columnOrder.indexOf(over.id as string)
        //         return Imports.arrayMove(columnOrder, oldIndex, newIndex) //this is just a splice util
        //     })
        // }

        // //row
        if (active && over && active.id !== over.id) {
            setData((data: any) => {
                const oldIndex = dataIds.indexOf(active.id)
                const newIndex = dataIds.indexOf(over.id)
                return Imports.arrayMove(data, oldIndex, newIndex) //this is just a splice util
            })
        }
    }



    return (
        <Imports.DndContext
            collisionDetection={Imports.closestCenter}
            modifiers={[Imports.restrictToHorizontalAxis, Imports.restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
        // sensors={sensors}
        >
            <div className="block max-w-full overflow-x-scroll overflow-y-hidden bg-slate-100">
                <div className="h-2" />
                <table>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup: any) => (
                            <tr key={headerGroup.id}>
                                <Imports.SortableContext items={columnOrder}
                                    strategy={Imports.horizontalListSortingStrategy}>
                                    {headerGroup.headers.map((header: any) => {
                                        return (
                                            <DraggableTableHeader key={header.id} header={header} />
                                        )
                                    })}
                                </Imports.SortableContext>
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {/* column */}
                        {/* {table.getRowModel().rows.map((row: any) => {
                            return (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell: any) => {
                                        return (
                                            <Imports.SortableContext

                                                key={cell.id}
                                                items={columnOrder}
                                                strategy={Imports.horizontalListSortingStrategy}
                                            >
                                                <DragAlongCell key={cell.id} cell={cell} />
                                            </Imports.SortableContext>
                                        )
                                    })}
                                </tr>
                            )
                        })} */}

                        {/* row */}
                        <Imports.SortableContext
                            items={dataIds}
                            strategy={Imports.verticalListSortingStrategy}
                        >
                            {table.getRowModel().rows.map((row: any) => (
                                <DraggableRow key={row.id} row={row} />
                            ))}
                        </Imports.SortableContext>
                    </tbody>
                </table>
                <div className="h-4" />
            </div>
        </Imports.DndContext>
    )
}

export default Imports.React.memo(MasterTable)