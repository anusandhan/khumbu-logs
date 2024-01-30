// import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  //   console.log("Request:", req);
  const summary = await req.json();
  console.log("Data:", summary);
  //   console.log("Request Body:", req.body);
  //   const { summary } = req.body;
  //   console.log("Req Summary:", summary);

  //   const summaryInput = JSON.stringify(summary);

  // const selectedProject = summary.summary.selectedProject;

  const prompt =
    "Summarize this logs data, be concise & use simple words. Log data:";
  const gptInput = prompt.concat(JSON.stringify(summary.summary));

  console.log(gptInput);

  //   return new Response(JSON.stringify(gptInput), {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });

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
