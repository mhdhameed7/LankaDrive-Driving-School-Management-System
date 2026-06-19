import React from 'react';
import { Search, Printer, FileDown, Calendar as CalendarIcon } from 'lucide-react';

const ReportActions = ({ 
  title, 
  searchTerm, 
  onSearchChange, 
  dateFilter, 
  onDateChange,
  showDateFilter = true,
  landscape = false
}) => {

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!window.api || !window.api.printToPDF) {
      // Fallback if not running inside Electron
      window.print();
      return;
    }

    try {
      const sanitizedTitle = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'report';
      const defaultName = `${sanitizedTitle}_report.pdf`;
      
      const result = await window.api.printToPDF({ 
        defaultName,
        landscape 
      });

      if (result && result.success) {
        console.log(`PDF successfully saved to: ${result.filePath}`);
      } else if (result && result.error) {
        alert(`Failed to export PDF: ${result.error}`);
      }
    } catch (err) {
      console.error('Export PDF error:', err);
      alert('An error occurred while exporting the PDF.');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 hide-on-print pb-4 border-b border-gray-100">
      <div>
        <h2 className="text-xl font-bold text-[#1e3a5f]">{title}</h2>
        <p className="text-sm text-gray-500">View and export your data</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-48 pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 text-sm"
          />
        </div>

        {/* Date Filter */}
        {showDateFilter && (
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="month" // or "date" depending on need, let's stick to simple text or month
              value={dateFilter}
              onChange={(e) => onDateChange(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 text-sm text-gray-600"
            />
          </div>
        )}

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Action Buttons */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Printer size={16} />
          Print
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-3 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors text-sm font-medium"
        >
          <FileDown size={16} />
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default ReportActions;

