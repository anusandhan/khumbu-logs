import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function getPersons() {
  const databaseId = process.env.NOTION_DATABASE_ID!;

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "Person",
        direction: "ascending",
      },
    ],
  });

  // Extract unique person names
  const persons = new Set();
  response.results.forEach((page: any) => {
    if (
      page.object === "page" &&
      page.properties &&
      page.properties.Person &&
      page.properties.Person.select
    ) {
      const personName = page.properties.Person.select.name;
      if (personName) {
        persons.add(personName);
      }
    }
  });
  const sortedPersons = Array.from(persons).sort();

  return sortedPersons;
}

export async function GET(request: Request) {
  const persons = await getPersons();
  return new Response(JSON.stringify(persons), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
