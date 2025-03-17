"use client";

import React, { useState, useEffect } from 'react';

// Main CRUD App Component
const CrudApp = () => {
  // State for items and form
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ id: null, name: '', description: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API base URL - replace with your actual API endpoint
  const API_URL = 'http://localhost:3434/api/locations';

  // Fetch all items from API
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(`Failed to fetch items: ${(err as Error).message}`);
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load items when component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  // Add a new item via API
  const addItem = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const newItem = await response.json();
      setItems(prevItems => [...prevItems, newItem]);
    } catch (err) {
      setError(`Failed to add item: ${(err as Error).message}`);
      console.error('Error adding item:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete an item via API
  const deleteItem = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      setEditing(false);
    } catch (err) {
      setError(`Failed to delete item: ${(err as Error).message}`);
      console.error('Error deleting item:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing item via API
  const updateItem = async (id, updatedItem) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const updated = await response.json();
      setItems(prevItems => 
        prevItems.map(item => (item.id === id ? updated : item))
      );
    } catch (err) {
      setError(`Failed to update item: ${(err as Error).message}`);
      console.error('Error updating item:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentItem.name.trim() || !currentItem.description.trim()) return;
    
    if (editing) {
      await updateItem(currentItem.id, currentItem);
      setEditing(false);
    } else {
      await addItem(currentItem);
    }
    setCurrentItem({ id: null, name: '', description: '' });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  // Set up for editing an item
  const editItem = (item) => {
    setEditing(true);
    setCurrentItem({ ...item });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">CRUD Operations App</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Item' : 'Add New Item'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="name"
              placeholder="Enter name"
              value={currentItem.name}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="description"
              placeholder="Enter description"
              value={currentItem.description}
              onChange={handleInputChange}
              rows="3"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end">
            {editing && (
              <button
                className="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => {
                  setEditing(false);
                  setCurrentItem({ id: null, name: '', description: '' });
                }}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Processing...' : editing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 bg-gray-50 border-b">Item List</h2>
        
        {loading && !items.length && (
          <div className="p-6 text-center text-gray-500">Loading items...</div>
        )}
        
        {!loading && !items.length && (
          <div className="p-6 text-center text-gray-500">No items found. Add some!</div>
        )}
        
        {items.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      onClick={() => editItem(item)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => deleteItem(item.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CrudApp;