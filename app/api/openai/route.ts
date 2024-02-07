// import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  const summary = await req.json();
  console.log("Data:", summary);

  const prompt1 = `Given a series of worklog entries in JSON format, I need a summary for each project and/or person. The summary should be structured in Markdown format with headings and bullet points. The title should depend on the information provided: use the project name if only the project is given, the person's name if only the person is given, both as title and subtitle if both are provided, or 'General Summary' if neither is provided. Include sections for tasks completed this week, tasks planned for next week, and blockers. Combine similar tasks and highlight recurring issues.
  Here is the JSON data:
  
  `;
  const prompt2 = `
  For each project and/or person in the JSON data, generate a summary with the following structure:

- If project is given:
  ### Project Name:
  - Display the project name.

- If person is given:
  ### Person Name:
  - Display the name of the person who logged the entries.

- For both project and person, if available:
  #### Project Name:
  - Display the project name.
  #### Person Name:
  - Display the name of the person.

- If neither project nor person is given:
  ### General Summary:

- For each entry:
  ### Tasks Completed This Week:
  - Summarize the tasks that were done this week, combining similar tasks across different days.

  ### Tasks Planned for Next Week:
  - Summarize the planned tasks for next week, highlighting any repeated or ongoing tasks.

  ### Blockers:
  - List any mentioned blockers, noting if they are recurring issues.

Please ensure that the summary is clear, concise, and well-formatted.`;
  const gptInput = prompt1
    .concat(JSON.stringify(summary.summary))
    .concat(prompt2);

  console.log(gptInput);

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: gptInput,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0].message.content);

  return new Response(JSON.stringify(completion.choices[0]), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
