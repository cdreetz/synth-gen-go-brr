import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function promptBuilder(domain: string, exampleType: string) {
  return `
    You are part of a system built to generate synthetic training data given some downstream task and training data type.
    The training data types are : "qa", "dialogue", "instruction", "completion", "few_shot"
    You are tasked with generating a training example of type: ${exampleType}
    The domain we are training for is: ${domain}
    --------
    Your response should not include anything but the single training data instance.
    Do not include any explanatory text as your response will be included directly as a training example as is.
    --------
    An example response is something like: define the chemical composition of Azithromycin, a type of antibiotic medication commonly used to treat bacterial infections, and describe its classification and typical dosage forms.
  `;
}

function promptBuilderAnswers(
  domain: string,
  exampleType: string,
  instruction: string,
) {
  return `
    You are part of a system built to generate synthetic training data given some downstream task and training data type.
    The training data types are : "qa", "dialogue", "instruction", "completion", "few_shot"
    You are tasked with generating a training example of type: ${exampleType}
    The domain we are training for is: ${domain}
    --------
    Your response should not include anything but the single training data instance.
    Do not include any explanatory text as your response will be included directly as a training example as is.
    We have already created the instruction and your job is to generate the answer to complete the pair.
    --------
    Please provide an answer for instruction question: ${instruction}
  `;
}

async function chat(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "llama-3.2-90b-vision-preview",
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0].message.content ?? '';
}

export async function POST(request: Request) {
  try {
    const { domain, exampleType, numExamples } = await request.json();

    // Generate instructions
    const pairs: { instruction: string; answer?: string }[] = [];
    const prompt = promptBuilder(domain, exampleType);

    for (let i = 0; i < numExamples; i++) {
      const instruction = await chat(prompt);
      pairs.push({ instruction });
    }

    // Generate answers for each instruction
    for (const pair of pairs) {
      const answerPrompt = promptBuilderAnswers(
        domain,
        exampleType,
        pair.instruction,
      );
      pair.answer = await chat(answerPrompt);
    }

    return NextResponse.json(pairs);
  } catch (error) {
    console.error("Error generating pairs:", error);
    return NextResponse.json(
      { error: "Failed to generate pairs" },
      { status: 500 },
    );
  }
}