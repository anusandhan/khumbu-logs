"use client";

import dynamic from "next/dynamic";

import React, { useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";

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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// import { Checkbox } from "@/components/ui/checkbox";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Skeleton } from "@/components/ui/skeleton";

import { Separator } from "@/components/ui/separator";

import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";

import {
  Snowflake,
  Sparkles,
  RefreshCw,
  Loader2,
  Hourglass,
} from "lucide-react";

import { useGlobalAudioPlayer } from "react-use-audio-player";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false, // This line disables server-side rendering
});

import documentAnimation from "@/public/animations/document.json";

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

  const { load } = useGlobalAudioPlayer();

  const [gptOutput, setGptOutput] = useState<string>("");

  const [isGptProcessing, setIsGptProcessing] = useState(false);

  const sampleGptOutput: string = `**Project Name:** AIRE

**Person Name:** Not specified

**Tasks Completed This Week:**

- Created and finalized UI mockups for the homepage redesign.
- Attended feedback sessions with the client regarding app interface.
- Handled responsibilities related to the update of brand style guide.
- Executed various test cases related to the new checkout process.
- Identified and logged bugs in the user registration flow.
- Carried out cross-browser testing for the main website.

**Tasks Planned for Next Week:**

- Commencing the wireframing for the new user dashboard.
- Collaborating with marketing for visuals related to an upcoming product launch.
- Reviewing and revising the mobile app design.
- Preparing test plans in view of an approaching release.
- Performing regression testing on the bugs that have been fixed.
- Working with developers to verify the resolved bugs.

**Blockers:**

- Pending client approval for the homepage redesign.
- Delays in bug fixes, which are causing consequent impact on the test schedules.`;

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
    playClickSound();
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

  const handleGenerateSummary = async () => {
    setIsGptProcessing(true);
    setGptOutput("Formatting logs");
    const sortedLogs = [...logsData].sort((a, b) => {
      const dateA = new Date(a.properties["Log Date"].date.start);
      const dateB = new Date(b.properties["Log Date"].date.start);

      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA.getTime() - dateB.getTime();
      } else {
        return 0;
      }
    });

    const summary = {
      selectedProject,
      selectedPerson,
      selectedDateRange,
      logs: sortedLogs.map((log) => ({
        date: log.properties["Log Date"].date.start,
        project: log.properties["Project"].select.name,
        person: log.properties["Person"].select.name,
        doneThisWeek: log.properties["Done This Week"].rich_text
          .map((text) => text.plain_text)
          .join(" "),
        toDoNextWeek: log.properties["To-Do Next Week"].rich_text
          .map((text) => text.plain_text)
          .join(" "),
        blockers: log.properties["Blockers"].rich_text
          .map((text) => text.plain_text)
          .join(" "),
      })),
    };

    console.log(summary);

    setGptOutput("");

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ summary }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data); // Handle the response from OpenAI
      setGptOutput(data.message.content);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
    setIsGptProcessing(false);
    playSuccessSound();
  };

  const playSelectSound = () => {
    load("/sounds/select.mp3", {
      autoplay: true,
    });
  };

  const playClickSound = () => {
    load("/sounds/click.mp3", {
      autoplay: true,
    });
  };

  const playSuccessSound = () => {
    load("/sounds/success.mp3", {
      autoplay: true,
    });
  };

  const playHoverSound = () => {
    load("/sounds/hover.mp3", {
      autoplay: true,
    });
  };

  if (!logsData) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <audio src="/sounds/click.mp3"></audio>
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 content-end md:place-items-end">
        <div className="w-full">
          <Label htmlFor="project">Project</Label>
          <Select onValueChange={handleProjectChange}>
            <SelectTrigger id="project">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value=" " onMouseEnter={playSelectSound}>
                All Projects
              </SelectItem>
              <Separator className="my-2" />
              <ScrollArea className="h-32">
                {projects.map((project) => (
                  <SelectItem
                    key={project}
                    value={project}
                    onMouseEnter={playSelectSound}
                  >
                    {project}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Label htmlFor="person">Person</Label>
          <Select onValueChange={handlePersonChange}>
            <SelectTrigger id="person">
              <SelectValue placeholder="Select" />
            </SelectTrigger>

            <SelectContent position="popper">
              <SelectItem value=" " onMouseEnter={playSelectSound}>
                Everyone
              </SelectItem>
              <Separator className="my-2" />
              <ScrollArea className="h-48">
                {persons.map((person) => (
                  <SelectItem
                    key={person}
                    value={person}
                    onMouseEnter={playSelectSound}
                  >
                    {person}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Label htmlFor="date">Date</Label>
          <Select onValueChange={handleDateChange}>
            <SelectTrigger id="date">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value=" " onMouseEnter={playSelectSound}>
                All Time
              </SelectItem>
              <Separator className="my-2" />
              <SelectItem value="this_week" onMouseEnter={playSelectSound}>
                This Week
              </SelectItem>
              <SelectItem value="past_month" onMouseEnter={playSelectSound}>
                This Month
              </SelectItem>
              <SelectItem value="past_year" onMouseEnter={playSelectSound}>
                This Year
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid content-end">
          <div className="flex">
            {logsData.length > 0 ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleGenerateSummary}
                    onMouseEnter={playHoverSound}
                    className="btn-glow"
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Summary
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] md:max-w-[50vw] rounded-4">
                  <DialogHeader>
                    <DialogTitle>Worklog Summary</DialogTitle>
                    <DialogDescription>
                      Summary of selected worklogs generated by GPT.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <ScrollArea className="h-[60vh] w-full grid place-content-center">
                      <ReactMarkdown className="prose">
                        {gptOutput}
                      </ReactMarkdown>
                      {isGptProcessing ? (
                        <div className="grid place-content-center h-full w-full">
                          <div className="h-16 w-16 ">
                            <Lottie
                              animationData={documentAnimation}
                              loop={true}
                            />
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </ScrollArea>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleGenerateSummary}
                      disabled={isGptProcessing}
                    >
                      {isGptProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Regenerate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>

      {/* <ReactMarkdown className="mt-12 prose">{sampleGptOutput}</ReactMarkdown> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
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
                {/* <div className="flex items-center space-x-2">
                  <Checkbox id="select-log" />
                  <label
                    htmlFor="select-log"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select
                  </label>
                </div> */}
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
