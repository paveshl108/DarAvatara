import { METAGRAPH_CORE_PROMPT } from "@/prompts/metagraph-core";

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey || !model) {
    return Response.json(
      { error: "OpenRouter environment variables are not configured." },
      { status: 500 },
    );
  }

  const body = await request.json();
  const { gender, name, selectedImages, answers } = body;

  if (!gender || !name || !Array.isArray(selectedImages) || !Array.isArray(answers)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const completionResponse = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: METAGRAPH_CORE_PROMPT,
          },
          {
            role: "user",
            content: `Сделай развернутый Метаграф-разбор. Не сокращай блоки до пары фраз. Каждый смысловой блок должен быть содержательным: 2–4 абзаца там, где это уместно. Итоговый текст должен ощущаться как глубокий персональный разбор, а не короткая сводка.

Данные прохождения:
${JSON.stringify(
  {
    gender,
    name,
    selectedImages,
    answers,
  },
  null,
  2,
)}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 2600,
      }),
    },
  );

  if (!completionResponse.ok) {
    return Response.json(
      { error: "OpenRouter analysis request failed." },
      { status: completionResponse.status },
    );
  }

  const completion = await completionResponse.json();
  const analysis = completion?.choices?.[0]?.message?.content;

  if (!analysis) {
    return Response.json(
      { error: "OpenRouter returned an empty analysis." },
      { status: 502 },
    );
  }

  return Response.json({ analysis });
}
