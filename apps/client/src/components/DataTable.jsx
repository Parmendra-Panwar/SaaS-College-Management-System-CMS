import React, { useState, useMemo } from 'react';

const DataTable = ({ columns, data, actions }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [columnFilters, setColumnFilters] = useState({});
    const [activeSearchCol, setActiveSearchCol] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const processedData = useMemo(() => {
        let filteredData = [...data];

        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            filteredData = filteredData.filter((item) => {
                return columns.some((col) => {
                    const value = col.accessor(item);
                    return String(value).toLowerCase().includes(lowercasedSearch);
                });
            });
        }

        if (Object.keys(columnFilters).length > 0) {
            filteredData = filteredData.filter((item) => {
                return Object.entries(columnFilters).every(([header, term]) => {
                    if (!term) return true;
                    const col = columns.find(c => c.header === header);
                    if (!col) return true;
                    const value = col.accessor(item);
                    return String(value).toLowerCase().includes(term.toLowerCase());
                });
            });
        }

        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                const col = columns.find(c => c.header === sortConfig.key);
                if (!col) return 0;
                const aValue = col.accessor(a);
                const bValue = col.accessor(b);
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredData;
    }, [data, searchTerm, columnFilters, sortConfig, columns]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return processedData.slice(startIndex, startIndex + rowsPerPage);
    }, [processedData, currentPage]);

    const totalPages = Math.ceil(processedData.length / rowsPerPage);

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className="py-4 px-6 font-bold text-gray-600 border-b border-gray-100 bg-gray-50 align-top relative"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between group">
                                                {activeSearchCol === col.header ? (
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        className="border border-indigo-300 rounded px-2 py-1 text-sm outline-none w-full font-normal"
                                                        value={columnFilters[col.header] || ''}
                                                        onChange={(e) => setColumnFilters({ ...columnFilters, [col.header]: e.target.value })}
                                                        onBlur={() => setActiveSearchCol(null)}
                                                        placeholder={`Search ${col.header}...`}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') setActiveSearchCol(null); }}
                                                    />
                                                ) : (
                                                    <span
                                                        className="cursor-pointer hover:text-indigo-600 border-b border-transparent hover:border-indigo-600 transition"
                                                        onClick={() => setActiveSearchCol(col.header)}
                                                        title="Click to search this column"
                                                    >
                                                        {col.header}
                                                    </span>
                                                )}

                                                <button
                                                    onClick={() => handleSort(col.header)}
                                                    title="Sort column"
                                                    className={`p-1 rounded hover:bg-gray-200 transition ${sortConfig.key === col.header ? 'text-indigo-600' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
                                                >
                                                    {sortConfig.key === col.header && sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                                </button>
                                            </div>
                                            {columnFilters[col.header] && activeSearchCol !== col.header && (
                                                <div className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-max flex gap-2 items-center">
                                                    "{columnFilters[col.header]}"
                                                    <button onClick={() => {
                                                        const newFilters = { ...columnFilters };
                                                        delete newFilters[col.header];
                                                        setColumnFilters(newFilters);
                                                    }} className="font-bold text-indigo-400 hover:text-indigo-800">×</button>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {actions && <th className="py-4 px-6 font-bold text-gray-600 bg-gray-50 border-b border-gray-100 align-top">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, rowIndex) => (
                                    <tr key={row._id || rowIndex} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                        {columns.map((col, colIndex) => (
                                            <td key={colIndex} className="py-4 px-6 text-gray-700">
                                                {col.accessor(row)}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="py-4 px-6">
                                                <div className="flex gap-2">
                                                    {actions(row)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="py-8 text-center text-gray-500">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 p-5 text-sm text-gray-500 font-semibold">
                    Total: {processedData.length} records
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-200 rounded-xl bg-white disabled:opacity-50 hover:bg-gray-50 transition font-semibold text-gray-600"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-bold text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-200 rounded-xl bg-white disabled:opacity-50 hover:bg-gray-50 transition font-semibold text-gray-600"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;
