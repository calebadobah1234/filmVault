"use client";

import Link from "next/link";
import React from "react";
import { GrNext, GrPrevious } from "react-icons/gr";

const Pagination = (props) => {
  const totalPages = Math.ceil(props.finalNumber / 30);
  const currentPage = Number(props.currentPage);

  const getPaginationArray = () => {
    const paginationArray = [];
    const pagesToShow = Math.min(props.paginatePagesToShow, totalPages);

    let startPage = Math.max(currentPage - Math.floor(pagesToShow / 2), 1);
    let endPage = startPage + pagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - pagesToShow + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationArray.push(i);
    }

    return paginationArray;
  };

  const paginationArray = getPaginationArray();

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const baseButtonStyles = `
    px-3 py-2 rounded-md 
    transition-all duration-300 ease-in-out
    font-medium text-sm
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
  `;

  const activeButtonStyles = `
    bg-blue-500 text-white
    hover:bg-blue-600
  `;

  const inactiveButtonStyles = `
    bg-gray-200 text-gray-700
    hover:bg-gray-300 hover:text-gray-900
  `;

  return (
    <nav className="flex justify-center mt-10" aria-label="Pagination">
      <ul className="flex space-x-2 items-center">
        {currentPage > 1 && (
          <Link
            href={`/${props.whatFor}-page?${props.whatFor}=${
              props.category
            }&skip=${currentPage - 1}&limit=30&currentPage=${currentPage - 1}`}
            onClick={handleScrollToTop}
          >
            <li className={`${baseButtonStyles} ${inactiveButtonStyles}`}>
              <GrPrevious className="w-5 h-5" />
            </li>
          </Link>
        )}

        {paginationArray[0] > 1 && (
          <>
            <Link
              href={`/${props.whatFor}-page?${props.whatFor}=${props.category}&skip=1&limit=30&currentPage=1`}
              onClick={handleScrollToTop}
            >
              <li className={`${baseButtonStyles} ${inactiveButtonStyles}`}>
                1
              </li>
            </Link>
            {paginationArray[0] > 2 && (
              <li className="text-gray-500 font-bold">...</li>
            )}
          </>
        )}

        {paginationArray.map((item) => (
          <Link
            key={item}
            href={`/${props.whatFor}-page?${props.whatFor}=${props.category}&skip=${item}&limit=30&currentPage=${item}`}
            onClick={handleScrollToTop}
          >
            <li
              className={`
                ${baseButtonStyles}
                ${
                  currentPage === item
                    ? activeButtonStyles
                    : inactiveButtonStyles
                }
              `}
            >
              {item}
            </li>
          </Link>
        ))}

        {paginationArray[paginationArray.length - 1] < totalPages && (
          <>
            {paginationArray[paginationArray.length - 1] < totalPages - 1 && (
              <li className="text-gray-500 font-bold">...</li>
            )}
            <Link
              href={`/${props.whatFor}-page?${props.whatFor}=${props.category}&skip=${totalPages}&limit=30&currentPage=${totalPages}`}
              onClick={handleScrollToTop}
            >
              <li className={`${baseButtonStyles} ${inactiveButtonStyles}`}>
                {totalPages}
              </li>
            </Link>
          </>
        )}

        {currentPage < totalPages && (
          <Link
            href={`/${props.whatFor}-page?${props.whatFor}=${
              props.category
            }&skip=${currentPage + 1}&limit=30&currentPage=${currentPage + 1}`}
            onClick={handleScrollToTop}
          >
            <li className={`${baseButtonStyles} ${inactiveButtonStyles}`}>
              <GrNext className="w-5 h-5" />
            </li>
          </Link>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
