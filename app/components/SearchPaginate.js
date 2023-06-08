import Link from "next/link";
import React from "react";
import { GrNext, GrPrevious } from "react-icons/gr";

const Pagination = (props) => {
  const paginationArray = Array.from(
    { length: props.paginatePagesToShow },
    (_, index) => {
      return props.startNumber + index;
    }
  );

  return (
    <div className="flex justify-center mt-10">
      <ul className="flex space-x-1">
        {props.currentPage > 1 && (
          <Link href={`/paginate-page/${Number(props.currentPage) - 1}`}>
            <li className="p-3 bg-gray-300 text-white hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
              <GrPrevious />
            </li>
          </Link>
        )}
        {paginationArray.map((item, index) => (
          <Link key={index} href={`/search-page/${params.searchKey}/${item}`}>
            <li
              className={`p-2 ${
                props.currentPage === item
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white transition-colors duration-300 cursor-pointer"
              }`}
            >
              {item}
            </li>
          </Link>
        ))}

        <Link href={`/paginate-page/${Number(props.currentPage) + 1}`}>
          <li className="p-3 bg-gray-300 text-white hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
            <GrNext />
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default Pagination;
