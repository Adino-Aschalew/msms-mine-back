import { useState, useCallback } from 'react';

export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(page, 1));
  }, []);

  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); 
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  const paginate = useCallback((items) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [currentPage, pageSize]);

  const totalPages = useCallback((totalItems) => {
    return Math.ceil(totalItems / pageSize);
  }, [pageSize]);

  const getPageInfo = useCallback((totalItems) => {
    const total = totalPages(totalItems);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems);
    
    return {
      currentPage,
      totalPages: total,
      pageSize,
      totalItems,
      startIndex,
      endIndex,
      hasNextPage: currentPage < total,
      hasPrevPage: currentPage > 1,
    };
  }, [currentPage, pageSize, totalPages]);

  return {
    currentPage,
    pageSize,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    reset,
    paginate,
    getPageInfo,
    setCurrentPage,
    setPageSize,
  };
};
