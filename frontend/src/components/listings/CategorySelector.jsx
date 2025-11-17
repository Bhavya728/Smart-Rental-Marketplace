import React, { useState } from 'react';
import { Search, Grid } from 'lucide-react';
import Dropdown from '../ui/Dropdown';
import listingService from '../../services/listingService';

const CategorySelector = ({
  selectedCategory = '',
  onCategoryChange,
  showSearch = true,
  showAllOption = true,
  layout = 'dropdown', // 'dropdown', 'grid', 'list'
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const categories = listingService.getCategories();
  const categoriesFlat = listingService.getAllCategoriesFlat();

  // Filter categories based on search term
  const filteredCategories = searchTerm
    ? Object.entries(categories).reduce((acc, [groupName, categoryList]) => {
        const filtered = categoryList.filter(cat =>
          cat.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
          acc[groupName] = filtered;
        }
        return acc;
      }, {})
    : categories;

  const handleCategorySelect = (categoryValue) => {
    onCategoryChange(categoryValue);
  };

  if (layout === 'dropdown') {
    const dropdownOptions = [];
    
    if (showAllOption) {
      dropdownOptions.push({ value: '', label: 'All Categories' });
    }

    Object.entries(categories).forEach(([groupName, categoryList]) => {
      // Add group header (disabled option)
      dropdownOptions.push({ 
        value: `__group_${groupName}`, 
        label: `— ${groupName} —`,
        disabled: true
      });
      
      // Add category options
      categoryList.forEach(category => {
        dropdownOptions.push({
          value: category.value,
          label: `${listingService.getCategoryIcon(category.value)} ${category.label}`
        });
      });
    });

    return (
      <div className={className}>
        <Dropdown
          options={dropdownOptions}
          value={selectedCategory}
          onChange={handleCategorySelect}
          placeholder="Select a category"
          searchable={showSearch}
          renderOption={(option) => (
            <span className={option.disabled ? 'font-semibold text-gray-500' : ''}>
              {option.label}
            </span>
          )}
        />
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className={`space-y-6 ${className}`}>
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {showAllOption && (
          <button
            onClick={() => handleCategorySelect('')}
            className={`group w-full p-6 border-2 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] ${
              selectedCategory === '' 
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20' 
                : 'border-gray-200 hover:border-blue-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                🏷️
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">All Categories</h3>
                <p className="text-sm text-gray-600 font-medium">Browse all available items</p>
              </div>
            </div>
          </button>
        )}

        <div className="space-y-6">
          {Object.entries(filteredCategories).map(([groupName, categoryList]) => (
            <div key={groupName}>
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                  <Grid className="w-4 h-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{groupName}</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryList.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategorySelect(category.value)}
                    className={`group p-5 border-2 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] ${
                      selectedCategory === category.value 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20' 
                        : 'border-gray-200 hover:border-blue-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                        {listingService.getCategoryIcon(category.value)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">
                          {category.label}
                        </h4>
                        <p className="text-sm text-gray-600 capitalize font-medium">
                          {category.value.replace(/-/g, ' ')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(filteredCategories).length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500">No categories found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className={`space-y-6 ${className}`}>
        {showSearch && (
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10">
              <Search className="w-full h-full" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 shadow-lg text-gray-900 placeholder-gray-500"
            />
          </div>
        )}

        {showAllOption && (
          <button
            onClick={() => handleCategorySelect('')}
            className={`group w-full p-4 border-2 rounded-xl text-left transition-all duration-300 flex items-center space-x-4 hover:scale-[1.01] ${
              selectedCategory === '' 
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20' 
                : 'border-gray-200 hover:border-blue-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
              🏷️
            </div>
            <span className="font-bold text-lg group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">All Categories</span>
          </button>
        )}

        <div className="space-y-4">
          {Object.entries(filteredCategories).map(([groupName, categoryList]) => (
            <div key={groupName}>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide mb-4 flex items-center">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2">
                  <span className="text-xs text-white font-bold">•</span>
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{groupName}</span>
              </h3>
              
              <div className="space-y-2">
                {categoryList.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategorySelect(category.value)}
                    className={`group w-full p-4 border-2 rounded-xl text-left transition-all duration-300 flex items-center space-x-4 hover:scale-[1.01] ${
                      selectedCategory === category.value 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg shadow-blue-500/20' 
                        : 'border-gray-200 hover:border-blue-300 text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                      {listingService.getCategoryIcon(category.value)}
                    </div>
                    <span className="font-bold group-hover:text-blue-600 transition-colors duration-300">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(filteredCategories).length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500">No categories found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default CategorySelector;