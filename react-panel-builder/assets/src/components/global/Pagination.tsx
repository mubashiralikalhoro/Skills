import { cn } from "../../utils";

interface Props {
  page: number;
  pageSize: number;
  totalCount: number;
  setPage: (page: number) => void;
  className?: string;
}

const Pagination = ({ totalCount, pageSize, page, setPage, className }: Props) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  const getPageNumbers = () => {
    let pages: any = [];

    if (totalPages <= 4) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      pages = [1];
      if (page > 4) pages.push("...");
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const getShowingText = () => {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalCount);
    return `Showing records ${start} to ${end} of ${totalCount}`;
  };

  return (
    <div className={cn("flex flex-col lg:flex-row justify-between lg:items-center gap-4 py-4", className)}>
      <div className="text-sm text-gray-600">
        <p>{getShowingText()}</p>
      </div>
      <div className="flex items-center gap-2 w-fit md:ml-auto flex-wrap">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="flex items-center gap-1 ">
          {getPageNumbers().map((p: any, index: number) => (
            <button
              key={index}
              onClick={() => typeof p === "number" && setPage(p)}
              disabled={typeof p !== "number"}
              className={cn(
                "min-w-[32px] h-8 flex items-center justify-center text-sm font-medium rounded-md transition-colors",
                typeof p !== "number"
                  ? "text-gray-500 cursor-default"
                  : p === page
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            page === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          )}
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
