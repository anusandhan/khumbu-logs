"use client";
import React, { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Skeleton } from "@/components/ui/skeleton";

import { Label } from "@/components/ui/label";

import { Snowflake, RocketIcon } from "lucide-react";

interface LogItem {
  id: string;
  created_time: string;
  last_edited_time: string;
  // ... other properties like 'created_by', 'last_edited_by', etc. if needed

  properties: {
    "Log Date": {
      date: {
        start: string;
        end: string | null;
      };
    };
    "Done This Week": {
      rich_text: Array<{
        plain_text: string;
        // Add other properties from rich_text if needed
      }>;
    };
    Blockers: {
      rich_text: Array<{
        plain_text: string;
        // Add other properties from rich_text if needed
      }>;
    };
    Person: {
      select: {
        name: string;
        color: string;
      };
    };
    Project: {
      select: {
        name: string;
        color: string;
      };
    };
    "To-Do Next Week": {
      rich_text: Array<{
        plain_text: string;
        // Add other properties from rich_text if needed
      }>;
    };
  };
  // Add other properties as needed
}

export default function Home() {
  const [logsData, setLogsData] = useState<LogItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("");

  useEffect(() => {
    console.log("Current logsData:", logsData);
  }, [logsData]);

  async function fetchData(project: string, dateRange: string) {
    if (!project) return;
    setIsLoading(true);
    try {
      let url = `/api/notion?project=${project}`;
      if (dateRange) {
        url += `&dateRange=${dateRange}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setLogsData(data.results || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  }

  const handleProjectChange = (value: string) => {
    console.log(value);
    setSelectedProject(value);
    fetchData(value, selectedDateRange);
  };

  const handleDateChange = (value: string) => {
    setSelectedDateRange(value);
    fetchData(selectedProject, value);
  };

  if (!logsData) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <div className="flex gap-4 flex-row items-end w-1/2">
        <div className="basis-1/3">
          <Label htmlFor="project">Project</Label>
          <Select onValueChange={handleProjectChange}>
            <SelectTrigger id="project">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="AIRE">AIRE</SelectItem>
              <SelectItem value="GenA">GenA</SelectItem>
              <SelectItem value="Growth">Growth</SelectItem>
              <SelectItem value="Acquisitions">Acquistions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="basis-1/3">
          <Label htmlFor="date">Date</Label>
          <Select onValueChange={handleDateChange}>
            <SelectTrigger id="date">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="this_week">This Week</SelectItem>
              {/* <SelectItem value="past_week">Past Week</SelectItem> */}
              <SelectItem value="past_month">This Month</SelectItem>
              <SelectItem value="past_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-12">
        {isLoading ? (
          // <div className="flex gap-1.5 items-center">
          //   <div>
          //     <Snowflake className="animate-spin text-slate-500" size={16} />
          //   </div>
          //   <p className="animate-pulse mt-0">Loading...</p>
          // </div>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-4 w-1/2"></Skeleton>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 text-slate-500">
                {/* <p className="font-semibold">✅ Done this week</p> */}
                <Skeleton className="mt-2 h-4 w-[250px]"></Skeleton>
              </div>
              <div className="grid grid-cols-1 text-slate-500">
                {/* <p className="font-semibold">📤 Todo next week</p> */}
                <Skeleton className="mt-2 h-4 w-[250px]"></Skeleton>
              </div>
              <div className="grid grid-cols-1 text-slate-500">
                {/* <p className="font-semibold">💥 Blockers</p> */}
                <Skeleton className="mt-2 h-4 w-[250px]"></Skeleton>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Skeleton className="mt-2 h-4 w-[250px]"></Skeleton>
            </CardFooter>
          </Card>
        ) : selectedProject === "" ? (
          <p>Please select a project to view worklogs.</p>
        ) : logsData.length === 0 ? (
          <Alert>
            <Snowflake className="text-slate-500" size={16} />
            <AlertTitle>No worklogs!</AlertTitle>
            <AlertDescription>
              No worklogs found for the selected project and time.
            </AlertDescription>
          </Alert>
        ) : (
          logsData.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.properties["Person"].select.name}</CardTitle>
                {/* <CardDescription>
                  <div>
                  <Badge>{item.properties["Project"].select.name}</Badge>
                </div>
                </CardDescription> */}
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 text-slate-500">
                  <p className="font-semibold">✅ Done this week</p>
                  <HoverCard>
                    <HoverCardTrigger>
                      <p className="truncate cursor-pointer">
                        {item.properties["Done This Week"].rich_text
                          .map((text) => text.plain_text)
                          .join(" ")}
                      </p>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      {item.properties["Done This Week"].rich_text
                        .map((text) => text.plain_text)
                        .join(" ")}
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="grid grid-cols-1 text-slate-500">
                  <p className="font-semibold">📤 Todo next week</p>
                  <HoverCard>
                    <HoverCardTrigger>
                      <p className="truncate cursor-pointer">
                        {item.properties["To-Do Next Week"].rich_text
                          .map((text) => text.plain_text)
                          .join(" ")}
                      </p>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      {item.properties["To-Do Next Week"].rich_text
                        .map((text) => text.plain_text)
                        .join(" ")}
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="grid grid-cols-1 text-slate-500">
                  <p className="font-semibold">💥 Blockers</p>
                  <HoverCard>
                    <HoverCardTrigger>
                      <p className="truncate cursor-pointer">
                        {item.properties["Blockers"].rich_text
                          .map((text) => text.plain_text)
                          .join(" ")}
                      </p>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      {item.properties["Blockers"].rich_text
                        .map((text) => text.plain_text)
                        .join(" ")}
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox id="select-log" />
                  <label
                    htmlFor="select-log"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.properties["Log Date"].date.start}
                </p>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
