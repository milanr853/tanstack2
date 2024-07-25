// React and React Table
import * as React from 'react';
import { HTMLAttributes, HTMLProps, CSSProperties } from 'react'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    sortingFns,
    SortingState,
    Header,
    Cell,
} from '@tanstack/react-table';

import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    type DragEndEvent,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
// needed for row & cell level scope DnD setup
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'



import type {
    Column,
    ColumnDef,
    ColumnFiltersState,
    RowData,
    FilterFn,
    SortingFn,
    Table,
} from '@tanstack/react-table';

// TanStack Match Sorter Utils
import {
    rankItem,
    compareItems,
} from '@tanstack/match-sorter-utils';

import type {
    RankingInfo,
} from '@tanstack/match-sorter-utils';



// Export React and React Table Functions
export {
    React,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    sortingFns,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    restrictToHorizontalAxis,
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
    CSS,
};

// Export Types
export type {
    Cell,
    CSSProperties,
    Header,
    HTMLAttributes, HTMLProps,
    SortingState,
    Column,
    ColumnDef,
    ColumnFiltersState,
    RowData,
    FilterFn,
    SortingFn,
    Table,
    RankingInfo,
    DragEndEvent,
    useSensor,
    useSensors
};

// Export Utilities and Custom Components
export {
    rankItem,
    compareItems,
};
