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
  - For each entry:
  ### Tasks Completed:
  - Summarize the tasks that were done this week, combining similar tasks across different days.

  ### Tasks Planned:
  - Summarize the planned tasks for next week, highlighting any repeated or ongoing tasks.

  ### Blockers:
  - List any mentioned blockers, noting if they are recurring issues.

Please ensure that the summary is clear, concise, and well-formatted.`;

  let dynamicPrompt = "";

  if (
    (summary.selectedProject && !summary.selectedPerson) ||
    summary.selectedPerson === " "
  ) {
    dynamicPrompt += `
    ### Project Name:
    - Summary in bullet points grouped by dates in weeks
    Example:
    **Feb 5-8**
    - Summary
    
    **Feb 12-15**
    - Summary
    
    Combine everyone persons' updates
    \n\n`;
  } else if (
    (!summary.selectedProject && summary.selectedPerson) ||
    summary.selectedProject === " "
  ) {
    dynamicPrompt += `
    ### Person Name:
    - Summary in bullet points grouped by projects
    
    Group same projects & similar tasks, no dates needed.
    
    Eg:
    **Project1**
    - Summary
    
    **Project2**
    - Summary
    \n\n`;
  } else if (summary.selectedProject && summary.selectedPerson) {
    dynamicPrompt += `### Person Name:
    - Summary in bullet points grouped by dates
    
    Eg:
    **Feb 5-8**
    - Summary
    
    **Feb 12-15**
    - Summary`;
  } else if (
    summary.selectedDate &&
    !summary.selectedPerson &&
    !summary.selectedProject
  ) {
    dynamicPrompt += `
    ### Date Range:
    - Summary in bullet points grouped by projects
    
    Eg:
    **Project1**
    - Summary
    
    **Project2**
    - Summary

    \n\n`;
  } else {
    dynamicPrompt += "### General Summary:\n\n";
  }
  const gptInput = prompt1
    .concat(JSON.stringify(summary.summary))
    .concat(dynamicPrompt)
    .concat(prompt2);

  console.log(gptInput);

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: gptInput,
      },
    ],
    model: "gpt-3.5-turbo-0125",
  });

  console.log(completion.choices[0].message.content);

  return new Response(JSON.stringify(completion.choices[0]), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
