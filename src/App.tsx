import React, { CSSProperties } from 'react';
import './index.css';
import {
  Cell,
  ColumnDef,
  Header,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { makeData, Athlete } from './makeData';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


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
        <button onClick={() => handlePinChange('left')} style={{ marginRight: '8px' }}>Pin Left</button>
        <button onClick={() => handlePinChange('none')}>Unpin</button>
        <button onClick={() => handlePinChange('right')} style={{ marginLeft: '8px' }}>Pin Right</button>
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

function App() {
  const columns = React.useMemo<ColumnDef<Athlete>[]>(
    () => [
      {
        accessorKey: 'name',
        cell: info => info.getValue(),
        header: 'Athlete Name',
        id: 'name',
        size: 200,
      },
      {
        accessorKey: 'age',
        cell: info => info.getValue(),
        header: 'Age',
        id: 'age',
        size: 80,
      },
      {
        accessorKey: 'country',
        cell: info => info.getValue(),
        header: 'Country',
        id: 'country',
        size: 150,
      },
      {
        accessorKey: 'year',
        cell: info => info.getValue(),
        header: 'Year',
        id: 'year',
        size: 100,
      },
      {
        accessorKey: 'date',
        cell: info => info.getValue(),
        header: 'Date',
        id: 'date',
        size: 150,
      },
      {
        accessorKey: 'sport',
        cell: info => info.getValue(),
        header: 'Sport',
        id: 'sport',
        size: 150,
      },
      {
        accessorKey: 'totalMedals',
        cell: info => info.getValue(),
        header: 'Total Medals',
        id: 'totalMedals',
        size: 120,
      },
    ],
    []
  );

  const [data, setData] = React.useState(() => makeData(20));
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map(c => c.id!)
  );
  const [pinnedColumnsState, setPinnedColumnsState] = React.useState({
    left: ['name'],
    right: ['totalMedals']
  });

  const rerender = () => setData(() => makeData(20));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder(columnOrder => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  const handlePinChange = (columnId: string, position: 'left' | 'none') => {
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

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // Determine which columns are pinned and which are not
  const pinnedColumns = [
    ...pinnedColumnsState.left,
    ...pinnedColumnsState.right,
  ];
  const nonPinnedColumns = columnOrder.filter(
    id => !pinnedColumns.includes(id)
  );

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

export default App;
