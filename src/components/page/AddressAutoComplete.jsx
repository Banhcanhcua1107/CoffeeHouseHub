// src/components/AddressAutoComplete.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { debounce } from 'lodash';

function AddressAutoComplete({ value, onChange }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  
  const justSelectedAnItem = useRef(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Debounced fetch function
  const debouncedFetch = useCallback(
  debounce(async (text) => {
    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY || process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      console.error("Geoapify API Key is missing in .env file");
      setLoading(false);
      return;
    }
    // Bounding box của TPHCM
    const hcmBoundingBox = "rect:106.363638,10.335253,107.027816,11.197184";
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&filter=${hcmBoundingBox}&lang=vi&apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 300),
  []
);


  useEffect(() => {
    if (justSelectedAnItem.current) {
      justSelectedAnItem.current = false;
      return;
    }

    debouncedFetch(inputValue);

    return () => {
      debouncedFetch.cancel();
    };
  }, [inputValue, debouncedFetch]);

  const handleInput = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setActiveSuggestion(-1);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSelect = (suggestion) => {
    const selectedAddress = suggestion.properties.formatted;
    justSelectedAnItem.current = true;
    
    setInputValue(selectedAddress);
    setSuggestions([]);
    if (onChange) {
      onChange(selectedAddress);
    }
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    }
    // Arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => (prev > 0 ? prev - 1 : -1));
    }
    // Enter
    else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeSuggestion]);
    }
  };

  // Highlight matching text in suggestion
  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name="address"
        placeholder="Nhập số nhà, tên đường..."
        className="w-full p-2 border rounded"
        value={inputValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border mt-1 rounded shadow-lg z-20 w-full max-h-60 overflow-y-auto text-sm">
          {suggestions.map((suggestion, index) => {
            const formatted = suggestion.properties.formatted;
            const address = suggestion.properties.address_line1 || formatted;
            
            return (
              <li
                key={suggestion.properties.place_id}
                className={`flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer ${
                  index === activeSuggestion ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleSelect(suggestion)}
              >
                <FaMapMarkerAlt className="text-gray-400 mr-3 flex-shrink-0" />
                <span 
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(formatted, inputValue)
                  }} 
                />
              </li>
            );
          })}
        </ul>
      )}
      {loading && inputValue && <p className="text-xs text-gray-500 mt-1">Đang tìm...</p>}
    </div>
  );
}

export default AddressAutoComplete;