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
import { getTransportIcon } from '../routes/page';

interface Transportation {
  id: number;
  originLocationCode: string;
  destinationLocationCode: string;
  transportationType: string;
  operatingDays: string;
  createdAt: string;
  updatedAt: string;
}

// Main CRUD App Component
const CrudApp = () => {
  // State for items and form
  const [transportations, setTransportations] = React.useState<Transportation[]>([]);
  const [currentItem, setCurrentItem] = useState<Transportation>(new Object() as Transportation);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const [filter, setFilter] = useState('');

  // API base URL - replace with your actual API endpoint
  const API_URL = 'http://localhost:3434/api/transportations';

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
      setTransportations(data);
      swal('Transportations fetched successfully.', '', 'success');
    } catch (err) {
      setError(`Failed to fetch items: ${(err as Error).message}`);
      console.error('Error fetching items:', err);
      swal(`Failed to fetch transportations.`, `${(err as Error).message}`, 'error');
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
  const addItem = async (item: Transportation) => {

    console.log("+++++++++++++++++++++++++++++++");
    console.log("item: " + JSON.stringify(item));
    console.log("+++++++++++++++++++++++++++++++");

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

      const transportationResponseData = await response.json();

      if (!response.ok) {
        const errorMessages = Object.values(transportationResponseData).join(', ');
        throw new Error(`HTTP error! Status: ${response.status}. Errors: ${errorMessages}`);
      }

      toast.success('Item added successfully');

      setTransportations(prevItems => [...prevItems, transportationResponseData]);
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
  const deleteItem = async (transportationId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${transportationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setTransportations(prevItems => prevItems.filter(transportationItem => transportationItem.id !== transportationId));
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
  const updateItem = async (id: number, updatedItem: Transportation) => {

    if (transportations.find(transportationItem =>
      transportationItem.originLocationCode === updatedItem.originLocationCode &&
      transportationItem.destinationLocationCode === updatedItem.destinationLocationCode &&
      transportationItem.transportationType === updatedItem.transportationType &&
      transportationItem.operatingDays === updatedItem.operatingDays)) {
      swal('Transportation already exists.', '', 'error');
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
      setTransportations(prevItems =>
        prevItems.map(transportationItem => (transportationItem.id === id ? updated : transportationItem))
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
    if (!currentItem.originLocationCode?.trim() || !currentItem.transportationType?.trim() || !currentItem.operatingDays?.trim() || !currentItem.destinationLocationCode?.trim()) {
      swal('Please fill all fields', '', 'error');
      return;
    }

    if (editing) {
      await updateItem(currentItem.id, currentItem);
      setEditing(false);
    } else {
      await addItem(currentItem);
    }
    setCurrentItem(new Object() as Transportation);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value || '' });
  };

  // Set up for editing an item
  const editItem = (item: Transportation) => {
    setEditing(true);
    setCurrentItem({ ...item });
  };

  useEffect(() => {
    if (!editing) {
      setCurrentItem(new Object() as Transportation);
    }
  }, [editing]);

  const handlePageClick = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  const filteredItems = useMemo(() => {
    const lowerFilter = filter.toLowerCase();
    return transportations.filter(location =>
      location.originLocationCode?.toLowerCase().includes(lowerFilter) ||
      location.destinationLocationCode?.toLowerCase().includes(lowerFilter) ||
      location.transportationType?.toLowerCase().includes(lowerFilter) ||
      location.operatingDays?.toLowerCase().includes(lowerFilter)
    );
  }, [filter, transportations]);

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredItems.slice(offset, offset + itemsPerPage);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Toaster className="" />
      <h1 className="text-3xl font-bold text-center mb-8">Transportations CRUD Operations</h1>

      {error && (
        <CustomAlert variant="destructive" title="Error" description={error} />
      )}

      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Item' : 'Add New Item'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="originLocationCode">
              Origin Location Code
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="originLocationCode"
              placeholder="Enter location code"
              value={currentItem.originLocationCode || ''}
              onChange={handleInputChange}
              disabled={loading}
              required={true}
              minLength={3}
              maxLength={5}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destinationLocationCode">
              Destination Location Code
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="destinationLocationCode"
              placeholder="Enter destination location code"
              value={currentItem.destinationLocationCode || ''}
              onChange={handleInputChange}
              disabled={loading}
              required={true}
              minLength={3}
              maxLength={5}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transportationType">
              Transportation Type
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="transportationType"
              value={currentItem.transportationType || ''}
              onChange={handleInputChange}
              disabled={loading}
              required={true}
            >
              <option value="" disabled>Select transportation type</option>
              <option value="BUS">BUS</option>
              <option value="FLIGHT">FLIGHT</option>
              <option value="UBER">UBER</option>
              <option value="SUBWAY">SUBWAY</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="operatingDays">
              Operating Days
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="operatingDays"
              placeholder="Enter operating days"
              value={currentItem.operatingDays || ''}
              onChange={handleInputChange}
              disabled={loading}
              required={true}
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

        {loading && !transportations.length && (
          <div className="p-6 text-center text-gray-500">Loading items...</div>
        )}

        {!loading && !transportations.length && (
          <div className="p-6 text-center text-gray-500">No items found. Add some!</div>
        )}

        {transportations.length > 0 && (
          <>
            <Table>
              <TableCaption>A list of transportations.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Actions</TableHead>
                  <TableHead>Operation Days</TableHead>
                  <TableHead>Origin Code</TableHead>
                  <TableHead>Destination Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Creation Date</TableHead>
                  <TableHead>Update Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((transportation) => (
                  <TableRow key={transportation.id}>
                    <TableCell key={transportation.id}>
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={() => editItem(transportation)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => deleteItem(transportation.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </TableCell>
                    <TableCell className="text-left">{transportation.operatingDays}</TableCell>
                    <TableCell className="font-medium text-left">{transportation.originLocationCode}</TableCell>
                    <TableCell className="font-medium text-left">{transportation.destinationLocationCode}</TableCell>
                    <TableCell className="text-left">{getTransportIcon(transportation.transportationType)}</TableCell>
                    <TableCell className="text-left">{transportation.createdAt}</TableCell>
                    <TableCell className="text-left">{transportation.updatedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total records</TableCell>
                  <TableCell className="text-right">{transportations.length}</TableCell>
                  <TableCell colSpan={5}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <ReactPaginate
              previousLabel={<ChevronLeft size={16} />}
              nextLabel={<ChevronRight size={16} />}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={Math.ceil(transportations.length / itemsPerPage)}
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