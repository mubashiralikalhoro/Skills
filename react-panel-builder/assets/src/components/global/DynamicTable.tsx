import React from "react";
import { cn } from "../../utils";
import useWindowSize from "../../hooks/useWindowSize";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

export interface TableStructure {
  heading: any;
  loadItem: (rowData: any, index: number) => any;
  sortField?: string;
}

interface Props {
  tableStructure: TableStructure[];
  data: any[];
  pageSize?: number;
  tbodyClassName?: string;
  trClassName?: string;
  tdClassName?: string;
  thClassName?: string;
  tableClassName?: string;
  containerClassName?: string;
  loading?: boolean;
  sortDirection?: "asc" | "desc";
  setSortDirection?: (order: "asc" | "desc") => void;
  sortColumn?: string;
  setSortColumn?: (field: string) => void;
}

const DynamicTable = ({
  tableStructure = [],
  data = [],
  tbodyClassName = "",
  trClassName = "",
  tdClassName = "",
  thClassName = "",
  tableClassName = "",
  containerClassName = "",
  loading = false,
  pageSize = 20,
  sortDirection,
  setSortDirection,
  sortColumn,
  setSortColumn,
}: Props) => {
  const { isMobile, width } = useWindowSize();

  const isTablet = width >= 768 && width < 1024;

  return (
    <div className={cn("  overflow-hidden w-full", containerClassName)}>
      {isTablet || isMobile ? (
        loading ? (
          <MobileLoading
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            tableStructure={tableStructure}
            cols={3}
          />
        ) : data.length > 0 ? (
          <div className="w-full text-sm">
            {data?.map((rowData, rowIndex) => (
              <div key={rowIndex} className="odd:bg-white even:bg-gray-50">
                {tableStructure.map(({ heading, loadItem, sortField }, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={cn(
                      "flex w-full justify-between border-b  border-zinc-200 items-center py-2 px-2",
                      colIndex === 0 && "bg-gray-100 text-gray-700"
                    )}
                  >
                    <div
                      className={cn("font-medium flex items-center gap-2 ", {
                        "cursor-pointer": sortField,
                      })}
                      onClick={() => {
                        if (sortField && setSortColumn) setSortColumn(sortField);
                        if (sortDirection && setSortDirection)
                          setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      }}
                    >
                      {heading} {sortField && sortColumn === sortField && getSortIcon(sortDirection || "asc")}
                    </div>
                    <div>{loadItem(rowData, rowIndex)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">No Record Found</div>
        )
      ) : (
        /* Desktop View - Traditional Table */
        <>
          {loading ? (
            <LoadingTable
              tableStructure={tableStructure}
              cols={pageSize}
              containerClassName={containerClassName}
              tableClassName={tableClassName}
              tbodyClassName={tbodyClassName}
              tdClassName={tdClassName}
              thClassName={thClassName}
              trClassName={trClassName}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
          ) : (
            <div className="w-full overflow-x-auto ">
              <div className={cn(`max-w-[calc(100vw-19rem)]`, containerClassName)}>
                <table className={cn("text-sm w-full text-left", tableClassName)}>
                  <thead>
                    <tr>
                      {tableStructure.map(({ heading, sortField }, index) => (
                        <th
                          key={index}
                          className={cn(
                            "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-100",
                            thClassName,
                            {
                              "cursor-pointer": sortField,
                            }
                          )}
                          onClick={() => {
                            if (sortField && setSortColumn) setSortColumn(sortField);
                            if (sortDirection && setSortDirection)
                              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {heading}{" "}
                            {sortField && sortColumn === sortField && getSortIcon(sortDirection || "asc")}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y divide-gray-200", tbodyClassName)}>
                    {data?.length > 0 ? (
                      data.map((rowData, rowIndex) => (
                        <tr key={rowIndex} className={cn("odd:bg-white even:bg-gray-50", trClassName)}>
                          {tableStructure.map(({ loadItem }, colIndex) => (
                            <td
                              key={`${rowIndex}-${colIndex}`}
                              className={cn("px-6 py-3 whitespace-nowrap", tdClassName)}
                            >
                              {loadItem(rowData, rowIndex)}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={tableStructure.length} className="px-6 py-4 text-center text-gray-500">
                          No Records Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DynamicTable;

interface LoadingTableProps {
  tableStructure: TableStructure[];
  cols: number;
  containerClassName?: string;
  tableClassName?: string;
  thClassName?: string;
  tbodyClassName?: string;
  trClassName?: string;
  tdClassName?: string;
  sortDirection?: "asc" | "desc";
  sortColumn?: string;
}

const LoadingTable = ({
  tableStructure,
  cols = 5,
  containerClassName,
  tableClassName,
  thClassName,
  tbodyClassName,
  trClassName,
  tdClassName,
  sortDirection,
  sortColumn,
}: LoadingTableProps) => {
  return (
    <div className="w-full overflow-x-auto ">
      <div className={cn(`max-w-[calc(100vw-19rem)]`, containerClassName)}>
        <table className={cn("text-sm w-full text-left", tableClassName)}>
          <thead>
            <tr>
              {tableStructure.map(({ heading, sortField }, index) => (
                <th
                  key={index}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-100",
                    thClassName
                  )}
                >
                  <div className="flex items-center gap-2">
                    {heading} {sortField && sortColumn === sortField && getSortIcon(sortDirection || "asc")}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn("divide-y divide-gray-200", tbodyClassName)}>
            {new Array(cols).fill(0).map((rowData, rowIndex) => (
              <tr key={rowIndex} className={cn("odd:bg-white even:bg-gray-50", trClassName)}>
                {tableStructure.map(({ loadItem }, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={cn("px-6 py-3 whitespace-nowrap", tdClassName)}
                  >
                    <div className="w-full h-4 bg-gray-200 rounded-md animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface MobileLoadingProps {
  tableStructure: TableStructure[];
  cols: number;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

const MobileLoading = ({ tableStructure, cols, sortColumn, sortDirection }: MobileLoadingProps) => {
  return (
    <div className="w-full text-sm">
      {new Array(cols).fill(0).map((rowData, rowIndex) => (
        <div key={rowIndex} className="odd:bg-white even:bg-gray-50">
          {tableStructure.map(({ heading, sortField }, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "flex w-full justify-between border-b  border-zinc-200 items-center py-2 px-2",
                colIndex === 0 && "bg-gray-100 text-gray-700"
              )}
            >
              <div className="font-medium flex items-center gap-2">
                {heading} {sortField && sortColumn === sortField && getSortIcon(sortDirection || "asc")}
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-md animate-pulse max-w-[120px]"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const getSortIcon = (order: "asc" | "desc") => {
  if (order === "asc") {
    return <FaArrowDown className="" />;
  }
  return <FaArrowUp className="" />;
};
