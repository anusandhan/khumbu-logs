import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// async function getNotionData() {
//   const databaseId: string = process.env.NOTION_DATABASE_ID!;
//   const response = await notion.databases.query({
//     database_id: databaseId,
//     filter: Filter,
//   });
//   return response;
// }

async function getNotionData(project: string) {
  const databaseId: string = process.env.NOTION_DATABASE_ID!;

  let queryOptions: any = {
    database_id: databaseId,
  };

  if (project) {
    queryOptions.filter = {
      property: "Project",
      select: {
        equals: project,
      },
    };
  }

  const response = await notion.databases.query(queryOptions);
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const project = url.searchParams.get("project") || "";

  const data = await getNotionData(project);
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
