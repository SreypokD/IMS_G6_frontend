import React, { useMemo } from "react";
import { Listbox } from "@headlessui/react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
} from "react-icons/md";
import { HiOutlineSelector } from "react-icons/hi";

export default function Pagination({
  total = 0,
  page = 1,
  limit = 10,
  onChange,
  pageOptions = [10, 15, 30, 60, 100, 300, 500],
}) {
  const last = Math.max(1, Math.ceil(total / limit));

  const pageList = useMemo(() => {
    if (total === 0 || !page || !limit) return [];
    if (last <= 7) {
      return Array.from({ length: last }, (_, i) => i + 1);
    } else if (page <= 4) {
      return [1, 2, 3, 4, ...(last > 4 ? [-1, last] : [])];
    } else if (page >= last - 3) {
      return [1, -1, ...Array.from({ length: 4 }, (_, i) => last - 3 + i)];
    } else {
      return [1, -1, page - 1, page, page + 1, -1, last];
    }
  }, [total, page, limit, last]);

  const handleGoTo = (p) => {
    if (p < 1 || p > last || p === page) return;
    onChange && onChange({ page: p, limit });
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    onChange && onChange({ page: 1, limit: newLimit });
  };

  return (
    <div className="flex items-center justify-center gap-2 pagination">
      <button
        type="button"
        className={`w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center disabled:opacity-50 ${page === 1 ? "pointer-events-none" : "cursor-pointer"}`}
        disabled={page === 1}
        onClick={() => handleGoTo(1)}
        aria-label="First page"
      >
        <MdFirstPage size={22} />
      </button>
      <button
        type="button"
        className={`w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center disabled:opacity-50 ${page === 1 ? "pointer-events-none" : "cursor-pointer"}`}
        disabled={page === 1}
        onClick={() => handleGoTo(page - 1)}
        aria-label="Previous page"
      >
        <MdChevronLeft size={22} />
      </button>
      {pageList.map((i, idx) =>
        i === -1 ? (
          <button
            key={idx}
            type="button"
            className={`ellipsis w-10 h-10 bg-transparent border-none text-gray-500 cursor-default text-lg`}
            disabled
          >
            ...
          </button>
        ) : (
          <button
            key={idx}
            type="button"
            className={`w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center mx-0.5 ${i === page ? "bg-[#1e3a5f] border-[#1e3a5f] text-white" : "bg-white"} ${i === page ? "pointer-events-none" : "cursor-pointer"}`}
            disabled={i === page}
            onClick={() => handleGoTo(i)}
          >
            {i}
          </button>
        ),
      )}
      <button
        type="button"
        className={`w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center disabled:opacity-50 ${page === last ? "" : "cursor-pointer"}`}
        disabled={page === last}
        onClick={() => handleGoTo(page + 1)}
        aria-label="Next page"
      >
        <MdChevronRight size={22} />
      </button>
      <button
        type="button"
        className={`w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center disabled:opacity-50 ${page === last ? "" : "cursor-pointer"}`}
        disabled={page === last}
        onClick={() => handleGoTo(last)}
        aria-label="Last page"
      >
        <MdLastPage size={22} />
      </button>
      <span className="text-base text-[#64748b]">Rows per page:</span>
      <Listbox
        value={limit}
        onChange={(val) => handleLimitChange({ target: { value: val } })}
      >
        <div className="relative w-20">
          <Listbox.Button className="cursor-pointer w-full bg-white border border-gray-300 rounded-lg px-2 py-1 text-left text-gray-800 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400">
            <span>{limit}</span>
            <HiOutlineSelector className="w-5 h-5 text-gray-400 ml-2" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
            {pageOptions.map((opt) => (
              <Listbox.Option
                key={opt}
                value={opt}
                className={({ active, selected }) =>
                  `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
                }
              >
                {opt}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
