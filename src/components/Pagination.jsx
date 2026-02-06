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

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        className={`w-9 h-9 rounded-lg border bg-white flex items-center justify-center border-gray-200 ${page === 1 ? "" : "cursor-pointer"}`}
        disabled={page === 1}
        onClick={() => handleGoTo(1)}
        aria-label="First page"
      >
        <MdFirstPage
          size={22}
          className={`${page === 1 ? "text-gray-200" : "text-gray-500"}`}
        />
      </button>
      <button
        type="button"
        className={`w-9 h-9 rounded-lg border bg-white flex items-center justify-center border-gray-200 ${page === 1 ? "" : "cursor-pointer"}`}
        disabled={page === 1}
        onClick={() => handleGoTo(page - 1)}
        aria-label="Previous page"
      >
        <MdChevronLeft
          size={22}
          className={`${page === 1 ? "text-gray-200" : "text-gray-500"}`}
        />
      </button>
      {pageList.map((i, idx) =>
        i === -1 ? (
          <button
            key={idx}
            type="button"
            className={`ellipsis w-9 h-9 bg-transparent border-none text-gray-200 cursor-default text-lg`}
            disabled
          >
            ...
          </button>
        ) : (
          <button
            key={idx}
            type="button"
            className={`w-9 h-9 rounded-lg border flex items-center justify-center mx-0.5 ${i === page ? "bg-[#1e3a5f] border-[#1e3a5f] text-white" : "bg-white border-gray-200"} ${i === page ? "pointer-events-none" : "cursor-pointer"}`}
            disabled={i === page}
            onClick={() => handleGoTo(i)}
          >
            {i}
          </button>
        ),
      )}
      <button
        type="button"
        className={`w-9 h-9 rounded-lg border bg-white flex items-center justify-center border-gray-200 ${page === last ? "" : "cursor-pointer"}`}
        disabled={page === last}
        onClick={() => handleGoTo(page + 1)}
        aria-label="Next page"
      >
        <MdChevronRight
          size={22}
          className={`${page === last ? "text-gray-200" : "text-gray-500"}`}
        />
      </button>
      <button
        type="button"
        className={`w-9 h-9 rounded-lg border bg-white flex items-center justify-center border-gray-200 ${page === last ? "" : "cursor-pointer"}`}
        disabled={page === last}
        onClick={() => handleGoTo(last)}
        aria-label="Last page"
      >
        <MdLastPage
          size={22}
          className={`${page === last ? "text-gray-200" : "text-gray-500"}`}
        />
      </button>
      <span className="text-sm text-[#64748b]">Rows per page:</span>
      <Listbox
        value={limit}
        onChange={(val) => onChange && onChange({ page: 1, limit: val })}
      >
        <div className="relative w-20">
          <Listbox.Button className="cursor-pointer w-full bg-white border border-gray-300 rounded-lg w-full h-10 px-2 text-left text-gray-800 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400">
            <span>{limit}</span>
            <HiOutlineSelector className="w-5 h-5 text-gray-400 ml-2" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
            {pageOptions.map((opt) => (
              <Listbox.Option
                key={opt}
                value={opt}
                className={({ selected }) =>
                  `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
