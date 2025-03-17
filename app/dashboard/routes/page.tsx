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
        setRoutes(multipliedRoutes);
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
        <Button variant="outline" className="w-full md:w-auto" onClick={handleSearch}>Search</Button>
      </div>

      {routes.length > 0 && (
        <div className="mt-4">
          <ScrollArea className="h-96 rounded-md border">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">Routes</h4>
              {routes.map((route, index) => (
                <React.Fragment key={index}>
                      <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        let message = `Description: ${route.description}\nOrigin: ${route.flight.origin}\nDestination: ${route.flight.destination}\nTransportation Type: ${route.flight.transportationType}`;
                        if (route.beforeFlightTransfer) {
                        message += `\n\nBefore Flight Transfer:\nOrigin: ${route.beforeFlightTransfer.origin}\nDestination: ${route.beforeFlightTransfer.destination}\nTransportation Type: ${route.beforeFlightTransfer.transportationType}`;
                        }
                        if (route.afterFlightTransfer) {
                        message += `\n\nAfter Flight Transfer:\nOrigin: ${route.afterFlightTransfer.origin}\nDestination: ${route.afterFlightTransfer.destination}\nTransportation Type: ${route.afterFlightTransfer.transportationType}`;
                        }
                        alert(message);
                      }}
                      key={index}
                      >
                      {route.description}
                      </Button><Separator className="my-2" />
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}


    </main>
  );
}
