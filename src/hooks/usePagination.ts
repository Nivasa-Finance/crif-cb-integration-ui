import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage: number;
}

export const usePagination = <T>({ data, itemsPerPage }: UsePaginationProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNext = () => goToPage(currentPage + 1);
  const goToPrevious = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNext,
    goToPrevious,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
    totalItems: data.length,
  };
};