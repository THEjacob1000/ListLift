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
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import {
  ArrowUpDown,
  Boxes,
  ChevronDown,
  ChevronUp,
  Layers3,
  SlidersVertical,
} from "lucide-react";
import { Task } from "@/lib/types";
import { capitalize } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import Heading from "../Heading";

interface MobileDataTableProps<TData extends Task, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function MobileDataTable<TData extends Task, TValue>({
  columns,
  data,
}: MobileDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "title", desc: false },
  ]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      title: true,
      status: true,
    });
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [collapsedGroups, setCollapsedGroups] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [drawOpen, setDrawOpen] = React.useState(false);

  const toggleGroup = (groupId: string | number) => {
    setCollapsedGroups((prev) => ({
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

  const sortOptions = [
    { id: "title", name: "Title" },
    { id: "status", name: "Status" },
    { id: "priority", name: "Priority" },
    { id: "deadline", name: "Deadline" },
  ];
  const groupOptions = [
    { id: "category", name: "Category" },
    { id: "priority", name: "Priority" },
  ];

  return (
    <div className="mt-6 pr-8 mb-20">
      <div className="flex items-center w-full justify-between py-4">
        <div className="flex gap-2 justify-between w-full">
          <Heading as="h2" size="sm">
            My Tasks
          </Heading>
          <Drawer open={drawOpen} onOpenChange={setDrawOpen}>
            <DrawerTrigger className="inline-flex gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md justify-center items-center px-2">
              <SlidersVertical size={24} />
              Sort Options
            </DrawerTrigger>
            <DrawerContent className="min-h-[50vh] px-8 flex flex-col gap-4">
              <div className="flex w-full items-center justify-between">
                <Heading as="h3" size="sm">
                  View Options
                </Heading>
                <Button
                  variant={"ghost"}
                  className="text-primary"
                  onClick={() => setDrawOpen(false)}
                >
                  Done
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div className="inline-flex gap-2">
                  <Layers3 size={16} className="mt-1" />
                  Group By
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={
                        grouping.length > 0 ? "default" : "outline"
                      }
                      className="ml-auto"
                    >
                      {grouping.length
                        ? capitalize(grouping[0])
                        : "None"}
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
                      <DropdownMenuRadioItem
                        value=""
                        className="pr-20"
                      >
                        None
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex justify-between items-center">
                <div className="inline-flex gap-2">
                  <ArrowUpDown size={16} className="mt-1" />
                  Sort by
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      {capitalize(sorting[0]?.id || "title")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuRadioGroup
                      value={sorting[0]?.id}
                      onValueChange={(value) => {
                        setSorting([
                          {
                            id: value,
                            desc: sorting[0]?.desc || false,
                          },
                        ]);
                      }}
                    >
                      {sortOptions.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.id}
                          value={option.id}
                        >
                          {option.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
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
                    {row
                      .getVisibleCells()
                      .filter(
                        (cell) =>
                          cell.column.id === "title" ||
                          cell.column.id === "status"
                      )
                      .map((cell) => (
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
