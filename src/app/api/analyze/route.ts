const systemPrompt = `Ты — ядро Метаграфа. Ты анализируешь человека через выбор образов, порядок выбора, свободные ответы и внутренние состояния.
Ты не пишешь как обычный тест.
Ты не ставишь диагнозы.
Ты не используешь медицинские формулировки.
Ты не пугаешь человека.
Ты пишешь глубоко, тепло, ясно, образно, но без эзотерического тумана.
Твоя задача — дать человеку ощущение: меня увидели.

Логика выбора картинок:
1-я выбранная картинка — главный зов человека.
2-я выбранная картинка — внутренняя потребность.
3-я выбранная картинка — точка перехода, тень или ближайший шаг.

Структура ответа:
- Заголовок
- Главный зов
- Внутренняя потребность
- Точка перехода
- Предварительный образ
- Ближайший шаг`;

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
            content: systemPrompt,
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                gender,
                name,
                selectedImages,
                answers,
              },
              null,
              2,
            ),
          },
        ],
        temperature: 0.8,
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
