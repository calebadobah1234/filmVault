import React from "react";

const Loading = () => {
  return (
    <>
      <div className="grid grid-cols-12 my-20">
        <div className="col-span-1"></div>
        <div
          role="status"
          class="col-span-10 space-y-8 animate-pulse md:space-y-0 md:space-x-8 md:flex md:items-center"
        >
          <div class="w-full flex flex-wrap">
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded-lg mx-3 dark:bg-gray-700 w-48 mb-4"></div>
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>
    </>
  );
};

export default Loading;
