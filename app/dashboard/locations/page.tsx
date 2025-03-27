"use client";

import { CustomAlert } from '@/app/ui/alert';
import { Toaster } from '@/components/ui/sonner';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import swal from 'sweetalert';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ReactPaginate from 'react-paginate';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  country: string;
  city: string;
  locationCode: string;
  createdAt: string;
  updatedAt: string;
}

// Main CRUD App Component
const CrudApp = () => {
  // State for items and form
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [currentItem, setCurrentItem] = useState<Location>(new Object() as Location);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const [filter, setFilter] = useState('');

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
      setLocations(data);
      swal('Locations fetched successfully.', '', 'success');
    } catch (err) {
      setError(`Failed to fetch items: ${(err as Error).message}`);
      console.error('Error fetching items:', err);
      swal(`Failed to fetch locations.`, `${(err as Error).message}`, 'error');
      setTimeout(fetchItems, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Load items when component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  // Add a new item via API
  const addItem = async (item: Location) => {
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

      const locationDataResponse = await response.json();

      if (!response.ok) {
        const errorMessages = Object.values(locationDataResponse).join(', ');
        throw new Error(`HTTP error! Status: ${response.status}. Errors: ${errorMessages}`);
      }

      toast.success('Item added successfully');

      setLocations(prevItems => [...prevItems, locationDataResponse]);
    } catch (err) {
      console.log("+++++++++++++++++++++++++++++++");
      console.log("err: " + err);
      console.log("+++++++++++++++++++++++++++++++");
      setError(`Failed to add item: ${(err as Error).message}`);
      console.error('Error adding item:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete an item via API
  const deleteItem = async (locationCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${locationCode}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setLocations(prevItems => prevItems.filter(location => location.locationCode !== locationCode));
      setEditing(false);
      fetchItems();
      toast.success('Item deleted successfully');
    } catch (err) {
      setError(`Failed to delete item: ${(err as Error).message}`);
      console.error('Error deleting item:', err);
      swal(`Failed to delete item.`, `${(err as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update an existing item via API
  const updateItem = async (id: number, updatedItem: Location) => {

    if (locations.find(location => location.locationCode === updatedItem.locationCode && location.id !== id)) {
      swal('Location code already exists.', '', 'error');
      return;
    }

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
      setLocations(prevItems =>
        prevItems.map(location => (location.id === id ? updated : location))
      );
      toast.success('Item updated successfully');
    } catch (err) {
      setError(`Failed to update item: ${(err as Error).message}`);
      console.error('Error updating item:', err);
      swal(`Failed to update item.`, `${(err as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentItem.name?.trim() || !currentItem.city?.trim() || !currentItem.locationCode?.trim() || !currentItem.country?.trim()) {
      swal('Please fill all fields', '', 'error');
      return;
    }

    if (editing) {
      await updateItem(currentItem.id, currentItem);
      setEditing(false);
    } else {
      await addItem(currentItem);
    }
    setCurrentItem(new Object() as Location);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value || '' });
  };

  // Set up for editing an item
  const editItem = (item: Location) => {
    setEditing(true);
    setCurrentItem({ ...item });
  };

  useEffect(() => {
    if (!editing) {
      setCurrentItem(new Object() as Location);
    }
  }, [editing]);

  const handlePageClick = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  const filteredItems = useMemo(() => {
    const lowerFilter = filter.toLowerCase();
    return locations.filter(location =>
      location.name?.toLowerCase().includes(lowerFilter) ||
      location.country?.toLowerCase().includes(lowerFilter) ||
      location.city?.toLowerCase().includes(lowerFilter) ||
      location.locationCode?.toLowerCase().includes(lowerFilter)
    );
  }, [filter, locations]);

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredItems.slice(offset, offset + itemsPerPage);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Toaster className="" />
      <h1 className="text-3xl font-bold text-center mb-8">Locations CRUD Operations</h1>

      {error && (
        <CustomAlert variant="destructive" title="Error" description={error} />
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
              value={currentItem.name || ''}
              onChange={handleInputChange}
              disabled={loading}
              required={true}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
              Country
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="country"
              placeholder="Enter country"
              value={currentItem.country || ''}
              onChange={handleInputChange}
              disabled={loading}
              required={true}
              minLength={3}
              maxLength={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
              City
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="city"
              placeholder="Enter city"
              value={currentItem.city || ''}
              onChange={handleInputChange}
              disabled={loading}
              required={true}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="locationCode">
              Location Code
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="locationCode"
              placeholder="Enter location code"
              value={currentItem.locationCode || ''}
              onChange={handleInputChange}
              disabled={loading}
              required={true}
              minLength={3}
              maxLength={5}
            />
          </div>

          <div className="flex justify-end">
            {editing && (
              <button
                className="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => {
                  setEditing(false);
                  setCurrentItem(currentItem);
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

        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filter">
              Filter
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="filter"
              placeholder="Enter filter keyword"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              disabled={loading}
            />
          </div>

        {loading && !locations.length && (
          <div className="p-6 text-center text-gray-500">Loading items...</div>
        )}

        {!loading && !locations.length && (
          <div className="p-6 text-center text-gray-500">No items found. Add some!</div>
        )}

        {locations.length > 0 && (
          <>
            <Table>
              <TableCaption>A list of locations.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Actions</TableHead>
                  <TableHead className="w-[100px]">Location Code</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Creation Date</TableHead>
                  <TableHead>Update Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((location) => (
                  <TableRow key={location.locationCode}>
                    <TableCell key={location.locationCode}>
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={() => editItem(location)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => deleteItem(location.locationCode)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{location.locationCode}</TableCell>
                    <TableCell className="text-left">{location.country}</TableCell>
                    <TableCell className="text-left">{location.name}</TableCell>
                    <TableCell className="text-left">{location.city}</TableCell>
                    <TableCell className="text-left">{location.createdAt}</TableCell>
                    <TableCell className="text-left">{location.updatedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total records</TableCell>
                  <TableCell className="text-right">{locations.length}</TableCell>
                  <TableCell colSpan={5}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <ReactPaginate
              previousLabel={<ChevronLeft size={16} />}
              nextLabel={<ChevronRight size={16} />}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={Math.ceil(locations.length / itemsPerPage)}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={'flex justify-center items-center gap-1 py-4 px-2'}
              pageClassName={'inline-flex items-center justify-center w-8 h-8 rounded-md text-sm border border-gray-300 bg-white hover:bg-blue-50 hover:text-blue-600 transition-colors'}
              pageLinkClassName={'flex items-center justify-center w-full h-full'}
              previousClassName={'inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white hover:bg-blue-50 hover:text-blue-600 transition-colors'}
              nextClassName={'inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white hover:bg-blue-50 hover:text-blue-600 transition-colors'}
              previousLinkClassName={'flex items-center justify-center w-full h-full'}
              nextLinkClassName={'flex items-center justify-center w-full h-full'}
              breakLinkClassName={'flex items-center justify-center px-3 py-1'}
              activeClassName={'!bg-blue-500 !text-white !border-blue-500 hover:!bg-blue-600'}
              disabledClassName={'opacity-50 cursor-not-allowed hover:bg-white hover:text-gray-500'}
            />
          </>
        )}

      </div>
    </div>
  );
};

export default CrudApp;