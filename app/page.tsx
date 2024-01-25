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

async function getData() {
  const response = await fetch("/api/notion");
  const data = await response.json();
  return data;
}

export default function Home() {
  const [logsData, setLogsData] = useState<LogItem[]>([]);

  useEffect(() => {
    getData().then((data) => {
      setLogsData(data.results || []);
    });
  }, []);

  if (!logsData) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <div className="flex gap-4 flex-row items-end w-1/2">
        <div className="basis-1/3">
          <Label htmlFor="project">Project</Label>
          <Select>
            <SelectTrigger id="project">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="aire">AIRE</SelectItem>
              <SelectItem value="gena">GenA</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="acquisitions">Acquistions</SelectItem>
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
          <Button>View Worklogs</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-12">
        {logsData.map((item: LogItem) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.properties["Person"].select.name}</CardTitle>
              <CardDescription>
                Date: {item.properties["Log Date"].date.start}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                {item.properties["Done This Week"].rich_text
                  .map((text) => text.plain_text)
                  .join(" ")}
              </p>
            </CardContent>
            <CardFooter>
              <p>Project: {item.properties["Project"].select.name}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
