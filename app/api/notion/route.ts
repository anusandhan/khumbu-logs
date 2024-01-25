import { Client } from "@notionhq/client";

const notion = new Client({
  auth: "secret_Sxswd4GatC0tEShSQ2lNtsov0uWfGfV7maU751qA0ck",
});

async function getNotionData() {
  const databaseId: string = "2b62ec8e0c7c4d3b9fb2e3a08103fae1";
  const response = await notion.databases.query({
    database_id: databaseId,
  });
  return response;
}

export async function GET(request: Request) {
  const data = await getNotionData();
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
