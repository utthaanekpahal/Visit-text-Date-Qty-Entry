
interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-lg border bg-white p-4 sm:flex-row">

      {/* LEFT: SCHOOLS PER PAGE */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="itemsPerPage"
          className="whitespace-nowrap text-xl font-medium text-black"
        >
          Schools per page:
        </label>

        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xl outline-none focus:border-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>

      {/* CENTER: ITEM COUNT */}
      <p className="text-xl text-black">
        Showing{" "}
        <span className="font-medium text-xl">
          {startItem}-{endItem}
        </span>{" "}
        of <span className="font-medium text-xl">{totalItems}</span> schools
      </p>

      {/* RIGHT: PREVIOUS AND NEXT ONLY */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || totalPages === 0}
          className="rounded-md border border-gray-300 px-4 py-2 text-xl font-medium hover:bg-gray-100 d"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="rounded-md border border-gray-300 px-4 py-2 text-xl font-medium hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}
