import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// type Filter = {
//   property?: string;
//   select?: { equals: string };
//   date?: { [key: string]: {} };
// };

// Function to construct and execute the Notion query
async function getNotionData(project: string, dateRange: string) {
  const databaseId: string = process.env.NOTION_DATABASE_ID!;
  let filters: any = [];

  if (project) {
    filters.push({
      property: "Project",
      select: {
        equals: project,
      },
    });
  }

  if (dateRange) {
    let dateFilter: any = { property: "Log Date" };
    dateFilter["date"] = { [dateRange]: {} };
    filters.push(dateFilter);
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: filters.length > 1 ? { and: filters } : filters[0],
  });

  return response;
}

// The API route handler
export async function GET(request: Request) {
  const url = new URL(request.url);
  const project = url.searchParams.get("project") || "";
  const dateRange = url.searchParams.get("dateRange") || "";

  const data = await getNotionData(project, dateRange);

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
