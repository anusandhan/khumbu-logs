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

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

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

  useEffect(() => {
    console.log("Current logsData:", logsData);
  }, [logsData]);

  async function fetchData(project: String) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notion?project=${project}`);
      const data = await response.json();
      setLogsData(data.results || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  }

  // Click handler for the button
  const handleButtonClick = () => {
    fetchData(selectedProject);
  };

  const handleProjectChange = (value: string) => {
    console.log(value);
    setSelectedProject(value);
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
          <Select>
            <SelectTrigger id="date">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="next">This Week</SelectItem>
              <SelectItem value="sveltekit">Past Week</SelectItem>
              <SelectItem value="astro">This Month</SelectItem>
              <SelectItem value="nuxt">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="basis-1/3 flex items-end">
          <Button onClick={handleButtonClick}>View Worklogs</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-12">
        {isLoading ? (
          <p>Loading...</p>
        ) : selectedProject === "" ? (
          <p>Please select a project to view worklogs.</p>
        ) : logsData.length === 0 ? (
          <p>No worklogs available for the selected project.</p>
        ) : (
          logsData.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.properties["Person"].select.name}</CardTitle>
                <CardDescription>
                  {/* <div>
                  <Badge>{item.properties["Project"].select.name}</Badge>
                </div> */}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 text-slate-500">
                  <p className="font-semibold">✅ Done this week</p>
                  <p>
                    {item.properties["Done This Week"].rich_text
                      .map((text) => text.plain_text)
                      .join(" ")}
                  </p>
                </div>
                <div className="grid grid-cols-1 text-slate-500">
                  <p className="font-semibold">📤 Todo next week</p>
                  <p>
                    {item.properties["To-Do Next Week"].rich_text
                      .map((text) => text.plain_text)
                      .join(" ")}
                  </p>
                </div>
                <div className="grid grid-cols-1 text-slate-500">
                  <p className="font-semibold">💥 Blockers</p>
                  <p>
                    {item.properties["Blockers"].rich_text
                      .map((text) => text.plain_text)
                      .join(" ")}
                  </p>
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
