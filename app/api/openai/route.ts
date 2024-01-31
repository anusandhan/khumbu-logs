// import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  const summary = await req.json();
  console.log("Data:", summary);

  const prompt1 =
    "I have a set of worklog entries that I need summarized. Each entry includes details about the project, person, date, tasks completed, upcoming tasks, and any blockers. The log data is formatted in JSON as follows:";
  const prompt2 =
    "Based on this data, please generate a summary that is organized by project and person. For each project and person, include the following sections:  Project Name: Display the project name. Person Name: Display the name of the person who logged the entries. Tasks Completed This Week: Summarize the tasks that were done this week, combining similar tasks across different days. Tasks Planned for Next Week: Summarize the planned tasks for next week, highlighting any repeated or ongoing tasks. Blockers: List any mentioned blockers, noting if they are recurring issues. Ensure that the summary is clear, concise, and well-formatted for easy understanding. Thank you!";
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
    model: "gpt-4",
  });

  console.log(completion.choices[0].message.content);

  return new Response(JSON.stringify(completion.choices[0]), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
