import React from 'react';
import { Bus, Car, Train, Plane, Circle, MapPin } from 'lucide-react';

const JourneyOverview = () => {
  // Sample route information - replace with your actual data
  const routeInfo = {
    origin: "New York",
    destination: "Los Angeles",
    transfers: [
      { point: "Philadelphia", type: "train" },
      { point: "Chicago", type: "bus" },
      { point: "Denver", type: "car" },
    ]
  };

  // Create a complete journey array including origin, transfers, and destination
  const journey = [
    { point: routeInfo.origin, type: null },
    ...routeInfo.transfers,
    { point: routeInfo.destination, type: null }
  ];

  // Get the appropriate icon for each transfer type
  const getTransportIcon = (type) => {
    switch (type) {
      case 'train':
        return <Train size={24} />;
      case 'bus':
        return <Bus size={24} />;
      case 'car':
        return <Car size={24} />;
      case 'plane':
        return <Plane size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Complete Journey Overview</h2>
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <div className="text-lg font-medium text-gray-800">From: {routeInfo.origin}</div>
          <div className="text-sm text-gray-500 my-2 md:my-0">
            {journey.length - 2} transfers
          </div>
          <div className="text-lg font-medium text-gray-800">To: {routeInfo.destination}</div>
        </div>
      </div>

      {/* Journey visualization - Desktop */}
      <div className="hidden md:block w-full bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center relative">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 h-1 bg-gray-300 top-1/2 transform -translate-y-1/2 z-0"></div>
          
          {/* Journey points */}
          {journey.map((stop, index) => (
            <div key={index} className="flex flex-col items-center relative z-10 flex-1">
              {/* Point marker */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                ${index === 0 ? 'bg-green-500' : index === journey.length - 1 ? 'bg-red-500' : 'bg-blue-500'} 
                text-white mb-2`}>
                {index === 0 ? <Circle size={24} /> : index === journey.length - 1 ? <MapPin size={24} /> : index}
              </div>
              
              {/* Point name */}
              <div className="text-sm font-medium text-center">{stop.point}</div>
              
              {/* Transport type */}
              {index < journey.length - 1 && (
                <div className="absolute flex items-center justify-center top-6 left-16 z-10">
                  <div className="bg-white p-1 rounded-full border border-gray-300">
                    {getTransportIcon(journey[index + 1].type)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Journey visualization - Mobile */}
      <div className="md:hidden w-full bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col">
          {journey.map((stop, index) => (
            <div key={index} className="relative">
              {/* Point with info */}
              <div className="flex items-center mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                  ${index === 0 ? 'bg-green-500' : index === journey.length - 1 ? 'bg-red-500' : 'bg-blue-500'} 
                  text-white mr-4`}>
                  {index === 0 ? <Circle size={20} /> : index === journey.length - 1 ? <MapPin size={20} /> : index}
                </div>
                <div className="font-medium">{stop.point}</div>
              </div>
              
              {/* Transport connector */}
              {index < journey.length - 1 && (
                <div className="flex items-center ml-5 mb-4 pl-8 border-l-2 border-gray-300">
                  <div className="bg-white p-1 rounded-full border border-gray-300 mr-2">
                    {getTransportIcon(journey[index + 1].type)}
                  </div>
                  <div className="text-sm text-gray-600">
                    via {journey[index + 1].type}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Journey details */}
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">Journey Details</h3>
        <div className="space-y-4">
          {journey.map((stop, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${index === 0 ? 'bg-green-500' : index === journey.length - 1 ? 'bg-red-500' : 'bg-blue-500'} 
                  text-white mr-3`}>
                  {index === 0 ? <Circle size={16} /> : index === journey.length - 1 ? <MapPin size={16} /> : index}
                </div>
                <div>
                  <div className="font-medium">{stop.point}</div>
                  <div className="text-sm text-gray-600">
                    {index === 0 ? 'Origin' : index === journey.length - 1 ? 'Destination' : 'Transfer Point'}
                  </div>
                </div>
              </div>
              
              {index < journey.length - 1 && (
                <div className="flex items-center mt-2 ml-11">
                  <div className="text-sm text-gray-600 flex items-center">
                    Next: {journey[index + 1].type} to {journey[index + 1].point}
                    <span className="ml-2">{getTransportIcon(journey[index + 1].type)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JourneyOverview;