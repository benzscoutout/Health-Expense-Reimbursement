import React from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from './Icons';

interface SearchFiltersProps {
  activeTab: 'analytics' | 'expenses' | 'employees';
  claimsCount: number;
  onTabChange: (tab: 'analytics' | 'expenses' | 'employees') => void;
  onSearch?: (query: string) => void;
  onStatusFilter?: (status: string) => void;
  onRiskFilter?: (risk: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  activeTab,
  claimsCount,
  onTabChange,
  onSearch,
  onStatusFilter,
  onRiskFilter
}) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onStatusFilter) {
      onStatusFilter(e.target.value);
    }
  };

  const handleRiskFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onRiskFilter) {
      onRiskFilter(e.target.value);
    }
  };

  return (
    <div className="search-filters">
      <div className="search-container">
        <div className="relative flex-1 w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="ค้นหาคำร้อง..." 
            className="search-input pl-[40px] w-full"
            onChange={handleSearch}
          />
        </div>
        <select className="filter-dropdown" onChange={handleStatusFilter}>
          <option>สถานะทั้งหมด</option>
          <option>รอดำเนินการ</option>
          <option>อนุมัติแล้ว</option>
          <option>ปฏิเสธแล้ว</option>
          <option>ทำเครื่องหมาย</option>
        </select>
        <select className="filter-dropdown" onChange={handleRiskFilter}>
          <option>ระดับความเสี่ยงทั้งหมด</option>
          <option>ความเสี่ยงสูง</option>
          <option>ความเสี่ยงปานกลาง</option>
          <option>ความเสี่ยงต่ำ</option>
        </select>
        <button className="btn btn-secondary btn-sm">
          <FunnelIcon className="w-4 h-4" />
          ตัวกรองเพิ่มเติม
        </button>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button 
          className={`category-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => onTabChange('analytics')}
        >
          วิเคราะห์ข้อมูล ({claimsCount})
        </button>
        <button 
          className={`category-tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => onTabChange('expenses')}
        >
          รายการค่าใช้จ่าย ({claimsCount})
        </button>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <span>แสดง {claimsCount} รายการ</span>
        <div className="pagination">
          <button className="pagination-button">‹</button>
          <button className="pagination-button active">1</button>
          <button className="pagination-button">2</button>
          <button className="pagination-button">3</button>
          <button className="pagination-button">›</button>
          <select className="filter-dropdown ml-2">
            <option>10 รายการต่อหน้า</option>
            <option>20 รายการต่อหน้า</option>
            <option>50 รายการต่อหน้า</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters; 