"use client";

import Image from "next/image";
import { useState } from "react";

const choiceImages = Array.from({ length: 8 }, (_, index) => {
  const imageNumber = index + 1;

  return {
    id: String(imageNumber),
    src: `/images/choice/${imageNumber}.png`,
  };
});

const questions = [
  "Что сейчас в жизни больше всего требует твоего внимания?",
  "В каком состоянии ты чаще всего находишься в последнее время?",
  "Что внутри тебя как будто уже готово измениться?",
  "Что тебе сложнее всего признать самому себе?",
  "Где ты сейчас больше всего теряешь энергию?",
  "Куда тебя тянет, даже если пока страшно туда идти?",
  "Какой шаг ты давно откладываешь, но чувствуешь, что он важен?",
];

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
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 text-zinc-950">
        <section className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Метаграф собран
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
            Твои ответы и выбранные образы сохранены внутри прохождения. На
            следующем этапе здесь появится персональный разбор.
          </p>
          <button
            type="button"
            className="mt-10 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7]"
          >
            Завершить
          </button>
        </section>
      </main>
    );
  }

  if (step === "questions") {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 py-10 text-zinc-950">
        <section className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
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
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] py-10 text-zinc-950">
        <section className="flex w-full flex-col items-center text-center">
          <h1 className="max-w-sm px-6 text-xl font-medium leading-7 tracking-tight text-zinc-800 sm:max-w-xl sm:text-2xl">
            Выбери 3 образа, которые сейчас откликаются
          </h1>
          <div className="mt-8 flex w-full snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:gap-6 sm:px-10 [&::-webkit-scrollbar]:hidden">
            {choiceImages.map((image) => {
              const isSelected = selectedImages.includes(image.id);
              const isLimitReached = selectedImages.length === 3 && !isSelected;

              return (
                <button
                  key={image.id}
                  type="button"
                  aria-pressed={isSelected}
                  aria-disabled={isLimitReached}
                  onClick={() => toggleImage(image.id)}
                  className={`relative aspect-[3/4] w-[78vw] max-w-[360px] flex-none snap-center overflow-hidden rounded-[28px] bg-[#F7F7F7] shadow-[0_18px_50px_rgba(24,24,27,0.12)] ring-1 transition sm:w-[320px] ${
                    isSelected
                      ? "ring-2 ring-zinc-950"
                      : "ring-zinc-200 hover:ring-zinc-400"
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
                      ✓
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
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 text-zinc-950">
        <section className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Ваше имя
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
            Имя поможет сделать разбор более личным.
          </p>
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
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 text-zinc-950">
        <section className="mx-auto flex max-w-2xl flex-col items-center text-center">
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
