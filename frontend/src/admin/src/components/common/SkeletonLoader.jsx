import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderCardSkeleton = () => (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 dark:bg-gray-700"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 dark:bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
          </div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="card animate-pulse">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-200 rounded w-1/3 dark:bg-gray-700"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded dark:bg-gray-600"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {[...Array(7)].map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChartSkeleton = () => (
    <div className="card p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 dark:bg-gray-700"></div>
      <div className="h-64 bg-gray-200 rounded dark:bg-gray-700"></div>
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 dark:bg-gray-700"></div>
          <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'table':
        return renderTableSkeleton();
      case 'chart':
        return renderChartSkeleton();
      case 'form':
        return renderFormSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
