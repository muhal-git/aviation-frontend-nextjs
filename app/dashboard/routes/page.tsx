"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as React from "react"
import { format, set } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Bus, Car, Train, Plane, Circle, MapPin, MoveRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from "sonner"
import swal from 'sweetalert';
import { Toaster } from "@/components/ui/sonner";

// Get the appropriate icon for each transfer type
export const getTransportIcon = (type: string) => {
  switch (type) {
    case 'SUBWAY':
      return <Train size={24} />;
    case 'BUS':
      return <Bus size={24} />;
    case 'UBER':
      return <Car size={24} />;
    case 'FLIGHT':
      return <Plane size={24} />;
    default:
      return null;
  }
};

interface Transfer {
  origin: string;
  destination: string;
  transportationType: string;
}

interface Flight {
  origin: string;
  destination: string;
  transportationType: string;
}

interface Route {
  description: string;
  beforeFlightTransfer: Transfer | null;
  flight: Flight;
  afterFlightTransfer: Transfer | null;
}

export default function TripSelection() {

  const [locations, setLocations] = React.useState([]);
  const [routes, setRoutes] = React.useState<Route[]>([]);

  // Get the appropriate icon for each transfer type
  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'SUBWAY':
        return <Train size={24} />;
      case 'BUS':
        return <Bus size={24} />;
      case 'UBER':
        return <Car size={24} />;
      case 'FLIGHT':
        return <Plane size={24} />;
      default:
        return null;
    }
  };

  React.useEffect(() => {
    fetch("http://localhost:3434/api/locations")
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error("Error fetching locations:", error));
  },
    []);

  const [date, setDate] = React.useState<Date>()
  const [origin, setOrigin] = React.useState<string>()
  const [destination, setDestination] = React.useState<string>()

  function handleSearch(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    if (!origin || !destination || !date) {
      alert("Please select an origin, destination, and date.");
      return;
    }

    setRoutes([]);
    fetch(`http://localhost:3434/api/routes?origin=${origin}&destination=${destination}&date=${format(date, "yyyy-MM-dd")}`)
      .then((response) => response.json())
      .then((data) => {
        const multipliedRoutes = data.flatMap((route: Route) => [route, route, route, route, route, route, route, route, route, route]);
        setRoutes(data);
        if (data.length === 0) {
          swal("No routes found", `from ${origin} to ${destination} on ${format(date, "PPP")}`, "warning");
        }
      })
      .catch((error) => console.error("Error fetching routes:", error));

  }

  const groupedLocations = locations.reduce((acc: { [key: string]: any[] }, location: { country: string }) => {
    if (!acc[location.country]) {
      acc[location.country] = [];
    }
    acc[location.country].push(location);
    return acc;
  }, {});

  return (
    <main>
      <div className="flex flex-col gap-2 md:flex-row md:gap-4">
        <div>
          <Select
            onValueChange={(value) => setOrigin(value)}
            required={true}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select Origin" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(groupedLocations).map((country) => (
                <SelectGroup key={country}>
                  <SelectLabel>{country}</SelectLabel>
                  {groupedLocations[country].map((location: { locationCode: string; name: string }) => (
                    <SelectItem key={location.locationCode} value={location.locationCode}>
                      {location.name} ({location.locationCode})
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            onValueChange={(value) => setDestination(value)}
            required={true}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select a Destination" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(groupedLocations).map((country) => (
                <SelectGroup key={country}>
                  <SelectLabel>{country}</SelectLabel>
                  {groupedLocations[country].map((location: { locationCode: string; name: string }) => (
                    <SelectItem key={location.locationCode} value={location.locationCode}>
                      {location.name} ({location.locationCode})
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full md:w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto" onClick={handleSearch}>Search</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search Routes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </div>

      {routes.length > 0 && (
        <div className="mt-4">
          <h2>Routes</h2>
          <ScrollArea className="h-96 rounded-md border">
            <div className="p-4">
              {routes.map((route, index) => (
                <React.Fragment key={index}>


                  <Drawer>
                    <DrawerTrigger className="w-full">
                      {route.description}
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Route Details</DrawerTitle>
                        <DrawerDescription className="mt-4">


                          <span className="flex items-center space-x-2 text-sm text-gray-600">
                            <Circle size={24} />
                            <span>{locations.filter((location: { locationCode: string }) => location.locationCode === origin)[0]["name"]}</span>
                          </span>

                          <span className="flex items-center space-x-2 text-sm text-gray-600">
                            {getTransportIcon(route.beforeFlightTransfer ? route.beforeFlightTransfer.transportationType : "")}
                            <span>{route.beforeFlightTransfer ? `${route.beforeFlightTransfer.transportationType} -> ${route.beforeFlightTransfer.destination}` : ''}</span>
                          </span>

                          <span className="flex items-center space-x-2 text-sm text-gray-600">
                            <Plane size={24} />
                            <span>{`FLIGHT -> ${route.flight.destination}`}</span>
                          </span>

                          <span className="flex items-center space-x-2 text-sm text-gray-600">
                            {getTransportIcon(route.afterFlightTransfer ? route.afterFlightTransfer.transportationType : "")}
                            <span>{route.afterFlightTransfer ? `${route.afterFlightTransfer.transportationType} -> ${route.afterFlightTransfer.destination}` : ''}</span>
                          </span>

                          <span className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin size={24} />
                            <span>{locations.filter((location: { locationCode: string }) => location.locationCode === destination)[0]["name"]}</span>
                          </span>


                        </DrawerDescription>
                      </DrawerHeader>
                      <DrawerFooter>

                        <Link
                          href={"#"}
                          className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                          onClick={() =>
                            toast("Ticket been created", {
                              description: `from ${origin} to ${destination} on ${date ? format(date, "PPP") : "unknown date"}`,
                              action: {
                                label: "Undo",
                                onClick: () => console.log("Undo"),
                              },
                            })
                          }
                        >
                          Continue
                        </Link>

                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  <Separator className="my-2" />
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <Toaster className="" />
    </main>
  );
}
