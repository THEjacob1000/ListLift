"use client";

import * as React from "react";

import {
  ColumnDef,
  flexRender,
  SortingState,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  GroupingState,
  VisibilityState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Boxes, ChevronDown, ChevronUp } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { Task } from "@/lib/types";
import AddTask from "../AddTask";
import DeleteCompleted from "../DeleteCompleted";

interface DataTableProps<TData extends Task, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Task, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "status", desc: true },
    { id: "deadline", desc: false },
  ]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [collapsedGroups, setCollapsedGroups] = React.useState<{
    [key: string]: boolean;
  }>({});
  const toggleGroup = (groupId: string | number) => {
    setCollapsedGroups((prev: { [key: string]: boolean }) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getGroupedRowModel: getGroupedRowModel(),

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      grouping,
    },
  });
  const groupOptions = [
    { id: "category", name: "Category" },
    { id: "priority", name: "Priority" },
  ];
  const categoryNames = Array.from(
    new Set(
      data
        .map((entry) => entry.category)
        .filter((category): category is string => !!category)
    )
  );

  return (
    <div className="mt-6">
      <div className="flex items-center w-full justify-between py-4">
        <div className="inline-flex gap-2">
          <Input
            placeholder="Filter tasks..."
            value={
              (table
                .getColumn("title")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn("title")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={grouping.length > 0 ? "default" : "outline"}
                className="ml-auto"
              >
                <Boxes size={16} className="mr-2" />
                Group By:{" "}
                {grouping.length ? capitalize(grouping[0]) : "None"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={grouping[0]}
                onValueChange={(value) => {
                  setGrouping(value ? [value] : []);
                  const newVisibility: VisibilityState = {};
                  table.getAllColumns().forEach((column) => {
                    newVisibility[column.id] = true;
                  });
                  if (value) {
                    newVisibility[value] = false;
                  }
                  table.setColumnVisibility(newVisibility);
                }}
              >
                {groupOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.id}
                    value={option.id}
                    className="pr-20"
                  >
                    {option.name}
                  </DropdownMenuRadioItem>
                ))}
                <DropdownMenuRadioItem value="" className="pr-20">
                  None
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          <DeleteCompleted />
          <AddTask categories={categoryNames} />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const isGrouped = row.subRows && row.subRows.length > 0;
              const groupingColumnId = grouping[0] || "No Category";
              const groupId = row.original[groupingColumnId];
              const isCompleted = row.original.status === "DONE";
              const rowClass = isCompleted
                ? "text-muted-foreground bg-black/20 line-through"
                : "";

              if (isGrouped) {
                const isCollapsed = collapsedGroups[groupId];
                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      onClick={() => toggleGroup(groupId)}
                      style={{ cursor: "pointer" }}
                      className={rowClass}
                    >
                      <TableCell colSpan={columns.length}>
                        <strong className="flex gap-2 items-center">
                          {capitalize(groupId)}{" "}
                          {isCollapsed ? (
                            <ChevronDown />
                          ) : (
                            <ChevronUp />
                          )}
                        </strong>
                      </TableCell>
                    </TableRow>
                    {!isCollapsed &&
                      row.subRows.map((subRow) => (
                        <TableRow
                          key={subRow.id}
                          className={
                            subRow.original.status === "DONE"
                              ? "bg-muted text-muted-foreground line-through"
                              : ""
                          }
                        >
                          {subRow.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </React.Fragment>
                );
              } else {
                return (
                  <TableRow key={row.id} className={rowClass}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              }
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
