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

import { Separator } from "@/components/ui/separator";

import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";

import { Snowflake, Sparkles } from "lucide-react";

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
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [projects, setProjects] = useState([]);
  const [persons, setPersons] = useState([]);

  useEffect(() => {
    console.log("Current logsData:", logsData);
  }, [logsData]);

  // Fetch projects and persons on component mount
  useEffect(() => {
    async function fetchPersonsProjects() {
      const projectsResponse = await fetch("/api/projects");
      const projectsData = await projectsResponse.json();
      const personsResponse = await fetch("/api/persons");
      const personsData = await personsResponse.json();

      setProjects(projectsData);
      setPersons(personsData);
    }

    fetchPersonsProjects();
  }, []);

  async function fetchData(project: string, dateRange: string, person: string) {
    // if (!project) return;
    setIsLoading(true);
    try {
      let url = `/api/notion?project=${project}`;
      if (dateRange) {
        url += `&dateRange=${dateRange}`;
      }
      if (person) {
        url += `&person=${person}`;
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
    fetchData(value, selectedDateRange, selectedPerson);
  };

  const handlePersonChange = (value: string) => {
    console.log(value);
    setSelectedPerson(value);
    fetchData(selectedProject, selectedDateRange, value);
  };

  const handleDateChange = (value: string) => {
    setSelectedDateRange(value);
    fetchData(selectedProject, value, selectedPerson);
  };

  if (!logsData) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <div className="flex gap-4 flex-row items-end">
        <div className="basis-1/4">
          <Label htmlFor="project">Project</Label>
          <Select onValueChange={handleProjectChange}>
            <SelectTrigger id="project">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value=" ">All Projects</SelectItem>
              <Separator className="my-2" />
              {projects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="basis-1/4">
          <Label htmlFor="date">Person</Label>
          <Select onValueChange={handlePersonChange}>
            <SelectTrigger id="date">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value=" ">All Person</SelectItem>
              <Separator className="my-2" />
              {persons.map((person) => (
                <SelectItem key={person} value={person}>
                  {person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="basis-1/4">
          <Label htmlFor="date">Date</Label>
          <Select onValueChange={handleDateChange}>
            <SelectTrigger id="date">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value=" ">All Time</SelectItem>
              <Separator className="my-2" />
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="past_month">This Month</SelectItem>
              <SelectItem value="past_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="basis-1/4 ml-4">
          <Button className="btn-glow">
            <Sparkles className="mr-2 h-4 w-4" /> Generate Summary
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-12">
        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-4 w-1/2"></Skeleton>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 text-slate-500">
                <Skeleton className="mt-2 h-4 w-[250px]"></Skeleton>
              </div>
              <div className="grid grid-cols-1 text-slate-500">
                <Skeleton className="mt-2 h-4 w-[250px]"></Skeleton>
              </div>
              <div className="grid grid-cols-1 text-slate-500">
                <Skeleton className="mt-2 h-4 w-[250px]"></Skeleton>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Skeleton className="mt-2 h-4 w-[250px]"></Skeleton>
            </CardFooter>
          </Card>
        ) : logsData.length === 0 ? (
          <Alert>
            <Snowflake className="text-slate-500 animate-pulse" size={16} />
            <AlertTitle>No worklogs!</AlertTitle>
            <AlertDescription>
              No worklogs found for the selected project, time and person.
            </AlertDescription>
          </Alert>
        ) : (
          logsData.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.properties["Person"].select.name}</CardTitle>
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
