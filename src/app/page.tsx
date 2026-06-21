"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const choiceImages = [
  {
    id: "1",
    src: "/images/choice/1.png",
    name: "Наблюдатель",
    tags: ["ум", "наблюдение", "глубина", "дистанция", "контроль", "достоинство"],
  },
  {
    id: "2",
    src: "/images/choice/2.png",
    name: "След",
    tags: ["тонкость", "пустота", "знак", "хрупкость", "поиск", "тишина"],
  },
  {
    id: "3",
    src: "/images/choice/3.png",
    name: "Живость",
    tags: ["ребёнок", "радость", "рост", "сердце", "простота", "тепло"],
  },
  {
    id: "4",
    src: "/images/choice/4.png",
    name: "Мечтатель",
    tags: ["отдых", "избегание", "тело", "зависание", "мечта", "пауза"],
  },
  {
    id: "5",
    src: "/images/choice/5.png",
    name: "Игра",
    tags: ["юмор", "абсурд", "лёгкость", "социальность", "вопрос", "игра"],
  },
  {
    id: "6",
    src: "/images/choice/6.png",
    name: "Нежность",
    tags: ["любовь", "контакт", "тепло", "привязанность", "сердце", "близость"],
  },
  {
    id: "7",
    src: "/images/choice/7.png",
    name: "Уязвимость",
    tags: [
      "тело",
      "стеснение",
      "проявленность",
      "уязвимость",
      "чувственность",
      "границы",
    ],
  },
  {
    id: "8",
    src: "/images/choice/8.png",
    name: "Вопрос",
    tags: ["интеллект", "сомнение", "пауза", "наблюдение", "выбор", "неясность"],
  },
];

const questions = [
  "Что сейчас в жизни больше всего требует вашего внимания?",
  "В каком состоянии вы чаще всего находитесь в последнее время?",
  "Что внутри вас как будто уже готово измениться?",
  "Что вам сложнее всего признать самому себе?",
  "Где вы сейчас больше всего теряете энергию?",
  "Куда вас тянет, даже если пока страшно туда идти?",
  "Какой шаг вы давно откладываете, но чувствуете, что он важен?",
];

const imageRoles = [
  {
    title: "Главный зов",
    description: "то, что сейчас сильнее всего притягивает",
  },
  {
    title: "Внутренняя потребность",
    description: "то, что просит внимания внутри",
  },
  {
    title: "Точка перехода",
    description: "тень, граница и ближайший шаг",
  },
];

const archetypes = [
  "Проводник",
  "Наблюдатель",
  "Творец",
  "Хранитель",
  "Искатель",
  "Мечтатель",
  "Игрок",
  "Собирающий себя",
];

type ChoiceImage = (typeof choiceImages)[number];
type Gender = "male" | "female" | null;

function SmallLogo() {
  return (
    <div className="fixed left-1/2 top-4 z-10 -translate-x-1/2">
      <Image
        src="/metagraph-logo.png"
        alt="Логотип Метаграф"
        width={2237}
        height={2358}
        sizes="72px"
        className="h-auto w-[72px]"
      />
    </div>
  );
}

function generateMetagraphResult({
  name,
  gender,
  selectedImageIds,
  answers,
}: {
  name: string;
  gender: Gender;
  selectedImageIds: string[];
  answers: string[];
}) {
  const selectedChoices = selectedImageIds
    .map((imageId) => choiceImages.find((image) => image.id === imageId))
    .filter((image): image is ChoiceImage => Boolean(image));
  const allTags = selectedChoices.flatMap((image) => image.tags);
  const answerText = answers.join(" ").toLowerCase();
  const genderText =
    gender === "male"
      ? "в мужском векторе"
      : gender === "female"
        ? "в женском векторе"
        : "в личном векторе";

  const tagScore = (tags: string[]) =>
    tags.reduce((score, tag) => score + allTags.filter((item) => item === tag).length, 0);

  const archetypeScores = [
    { name: "Проводник", score: tagScore(["знак", "поиск", "выбор", "глубина"]) },
    {
      name: "Наблюдатель",
      score: tagScore(["наблюдение", "ум", "дистанция", "интеллект"]),
    },
    { name: "Творец", score: tagScore(["рост", "радость", "игра", "проявленность"]) },
    {
      name: "Хранитель",
      score: tagScore(["тепло", "сердце", "любовь", "контакт", "близость"]),
    },
    { name: "Искатель", score: tagScore(["поиск", "сомнение", "неясность", "вопрос"]) },
    { name: "Мечтатель", score: tagScore(["мечта", "пауза", "отдых", "зависание"]) },
    { name: "Игрок", score: tagScore(["юмор", "абсурд", "лёгкость", "игра"]) },
    {
      name: "Собирающий себя",
      score: tagScore(["границы", "уязвимость", "тело", "контроль", "тишина"]),
    },
  ];
  const preliminaryArchetype =
    archetypeScores.sort((first, second) => second.score - first.score)[0]?.name ??
    archetypes[0];

  const nearestStep = answerText.match(/страш|бою|страх/)
    ? "Начни с маленького действия там, где уже есть страх: не чтобы победить его сразу, а чтобы вернуть себе право двигаться рядом с ним."
    : answerText.match(/устал|энерг|сил|пауза|отдых/)
      ? "Сначала верни себе опору в теле и ритме: убери один лишний расход энергии и освободи место для того, что действительно зовёт."
      : answerText.match(/хочу|тянет|важн|измен/)
        ? "Выбери один конкретный шаг к тому, что давно тянет, и сделай его достаточно маленьким, чтобы он стал реальным уже сейчас."
        : "Сформулируй один честный шаг, который можно сделать без рывка: не финальное решение, а движение, после которого появится больше ясности.";

  return {
    title: `${name.trim() || "Метаграф"}, ваш Метаграф собран`,
    intro: `Это ${genderText}: не ярлык и не диагноз, а мягкая карта того, что проявилось через выбранные образы и ответы.`,
    imageBlocks: selectedChoices.map((image, index) => ({
      title: imageRoles[index]?.title ?? `Образ ${index + 1}`,
      role: imageRoles[index]?.description ?? "выбранный образ",
      image,
      text:
        index === 0
          ? `${image.name} показывает главный зов: здесь много темы «${image.tags.slice(0, 3).join(", ")}». Похоже, внимание тянется к тому, что хочет быть увиденным без суеты и давления.`
          : index === 1
            ? `${image.name} раскрывает внутреннюю потребность: «${image.tags.slice(0, 3).join(", ")}». Этот слой просит не ускорения, а бережного признания того, что уже давно звучит внутри.`
            : `${image.name} обозначает точку перехода: «${image.tags.slice(0, 3).join(", ")}». Здесь может быть не самый громкий, но самый честный ближайший шаг.`,
    })),
    archetype: {
      title: preliminaryArchetype,
      text: `Предварительный образ сейчас ближе к архетипу «${preliminaryArchetype}». Он собирается из повторяющихся оттенков: ${Array.from(new Set(allTags)).slice(0, 8).join(", ")}. В этом есть не роль для игры, а способ заметить, через что тебе легче возвращаться к себе.`,
    },
    nearestStep,
  };
}

export default function Home() {
  const [step, setStep] = useState<
    "start" | "gender" | "name" | "images" | "questions" | "result"
  >("start");
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);
  const [name, setName] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const metagraphResult = useMemo(
    () =>
      generateMetagraphResult({
        name,
        gender: selectedGender,
        selectedImageIds: selectedImages,
        answers,
      }),
    [answers, name, selectedGender, selectedImages],
  );

  const toggleImage = (image: string) => {
    setSelectedImages((currentImages) => {
      if (currentImages.includes(image)) {
        return currentImages.filter((selectedImage) => selectedImage !== image);
      }

      if (currentImages.length === 3) {
        return currentImages;
      }

      return [...currentImages, image];
    });
  };

  const saveAnswerAndContinue = () => {
    const nextAnswers = [...answers];

    nextAnswers[questionIndex] = currentAnswer.trim();
    setAnswers(nextAnswers);
    setCurrentAnswer("");

    if (questionIndex === questions.length - 1) {
      setStep("result");
      return;
    }

    setQuestionIndex((currentIndex) => currentIndex + 1);
  };

  if (step === "result") {
    return (
      <main className="flex min-h-screen flex-1 justify-center bg-[#F7F7F7] px-6 pb-10 pt-28 text-zinc-950">
        <section className="mx-auto flex w-full max-w-3xl flex-col">
          <SmallLogo />
          <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-5xl">
            {metagraphResult.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-zinc-600">
            {metagraphResult.intro}
          </p>
          <div className="mt-10 flex flex-col gap-5">
            {metagraphResult.imageBlocks.map((block, index) => (
              <article
                key={block.title}
                className="rounded-[28px] border border-zinc-200 bg-white/70 p-6 text-left shadow-sm"
              >
                <p className="text-sm font-medium text-zinc-500">
                  {index + 1}. {block.role}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {block.title}: {block.image.name}
                </h2>
                <p className="mt-4 text-base leading-7 text-zinc-700">
                  {block.text}
                </p>
                <p className="mt-4 text-sm leading-6 text-zinc-500">
                  Теги: {block.image.tags.join(", ")}
                </p>
              </article>
            ))}
            <article className="rounded-[28px] border border-zinc-200 bg-white/70 p-6 text-left shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight">
                Предварительный образ: {metagraphResult.archetype.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-700">
                {metagraphResult.archetype.text}
              </p>
            </article>
            <article className="rounded-[28px] border border-zinc-200 bg-white/70 p-6 text-left shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight">
                Ближайший шаг
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-700">
                {metagraphResult.nearestStep}
              </p>
            </article>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-zinc-500">
            Это предварительная версия разбора. Позже здесь появится полноценный
            ИИ-анализ по ядру Метаграфа.
          </p>
          <button
            type="button"
            className="mx-auto mt-8 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7]"
          >
            Завершить
          </button>
        </section>
      </main>
    );
  }

  if (step === "questions") {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 pb-10 pt-28 text-zinc-950">
        <section className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <SmallLogo />
          <p className="text-sm font-medium text-zinc-500">
            Вопрос {questionIndex + 1} из {questions.length}
          </p>
          <h1 className="mt-5 text-2xl font-medium leading-9 tracking-tight text-zinc-900 sm:text-4xl sm:leading-tight">
            {questions[questionIndex]}
          </h1>
          <textarea
            value={currentAnswer}
            onChange={(event) => setCurrentAnswer(event.target.value)}
            rows={6}
            placeholder="Напиши свой ответ..."
            className="mt-8 w-full resize-none rounded-3xl border border-zinc-200 bg-white/80 px-5 py-4 text-left text-base leading-7 text-zinc-950 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
          />
          <button
            type="button"
            disabled={!currentAnswer.trim()}
            onClick={saveAnswerAndContinue}
            className="mt-8 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none"
          >
            Далее
          </button>
        </section>
      </main>
    );
  }

  if (step === "images") {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] pb-10 pt-28 text-zinc-950">
        <section className="flex w-full flex-col items-center text-center">
          <SmallLogo />
          <h1 className="max-w-sm px-6 text-xl font-medium leading-7 tracking-tight text-zinc-800 sm:max-w-xl sm:text-2xl">
            Выбери 3 образа, которые сейчас откликаются, и нажми на них
          </h1>
          <div className="mt-8 flex w-full snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:gap-6 sm:px-10 [&::-webkit-scrollbar]:hidden">
            {choiceImages.map((image) => {
              const isSelected = selectedImages.includes(image.id);
              const selectionOrder = selectedImages.indexOf(image.id) + 1;
              const isLimitReached = selectedImages.length === 3 && !isSelected;

              return (
                <button
                  key={image.id}
                  type="button"
                  aria-pressed={isSelected}
                  aria-disabled={isLimitReached}
                  onClick={() => toggleImage(image.id)}
                  className={`relative aspect-[3/4] w-[78vw] max-w-[360px] flex-none snap-center overflow-hidden rounded-[28px] bg-[#F7F7F7] transition sm:w-[320px] ${
                    isSelected
                      ? "ring-2 ring-zinc-950"
                      : ""
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={`Образ ${image.id}`}
                    fill
                    sizes="(max-width: 640px) 78vw, 320px"
                    className={`object-cover transition ${
                      isLimitReached ? "opacity-60" : "opacity-100"
                    }`}
                  />
                  {isSelected ? (
                    <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950 text-xl font-medium text-white shadow-lg">
                      {selectionOrder}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {selectedImages.length === 3 ? (
            <button
              type="button"
              onClick={() => setStep("questions")}
              className="mt-10 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7]"
            >
              Далее
            </button>
          ) : null}
        </section>
      </main>
    );
  }

  if (step === "name") {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 pb-10 pt-28 text-zinc-950">
        <section className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <SmallLogo />
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Ваше имя
          </h1>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Введите имя"
            className="mt-8 w-full rounded-full border border-zinc-200 bg-white/80 px-6 py-4 text-center text-lg text-zinc-950 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
          />
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => setStep("images")}
            className="mt-8 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none"
          >
            Далее
          </button>
        </section>
      </main>
    );
  }

  if (step === "gender") {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 pb-10 pt-28 text-zinc-950">
        <section className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SmallLogo />
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Выберите пол:
          </h1>
          <div className="mt-10 grid w-full max-w-lg gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSelectedGender("male")}
              className={`rounded-2xl border px-8 py-6 text-lg font-medium shadow-sm transition-colors ${
                selectedGender === "male"
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400"
              }`}
            >
              Мужчина
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender("female")}
              className={`rounded-2xl border px-8 py-6 text-lg font-medium shadow-sm transition-colors ${
                selectedGender === "female"
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400"
              }`}
            >
              Женщина
            </button>
          </div>
          {selectedGender ? (
            <button
              type="button"
              onClick={() => setStep("name")}
              className="mt-10 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7]"
            >
              Далее
            </button>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-1 justify-center bg-[#F7F7F7] px-6 text-zinc-950">
      <section className="mx-auto flex max-w-2xl flex-col items-center pt-6 text-center">
        <Image
          src="/metagraph-logo.png"
          alt="Логотип Метаграф"
          width={2237}
          height={2358}
          priority
          sizes="43vh"
          className="h-[45vh] w-auto"
        />
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
          Метаграф
        </h1>
        <button
          type="button"
          onClick={() => setStep("gender")}
          className="mt-10 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7]"
        >
          Начать
        </button>
      </section>
    </main>
  );
}
