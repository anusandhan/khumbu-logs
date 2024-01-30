import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function getProjects() {
  const databaseId = process.env.NOTION_DATABASE_ID!;

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "Project",
        direction: "ascending",
      },
    ],
  });

  // Extract unique project names
  const projects = new Set();
  response.results.forEach((page: any) => {
    if (
      page.object === "page" &&
      page.properties &&
      page.properties.Project &&
      page.properties.Project.select
    ) {
      const projectName = page.properties.Project.select.name;
      if (projectName) {
        projects.add(projectName);
      }
    }
  });

  const sortedProjects = Array.from(projects).sort();

  return sortedProjects;
}

export async function GET(request: Request) {
  const projects = await getProjects();
  return new Response(JSON.stringify(projects), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
