"use client";

import Image from "next/image";
import { useState } from "react";

const imageCards = [
  "Лес",
  "Огонь",
  "Вода",
  "Дорога",
  "Дверь",
  "Гора",
  "Зеркало",
  "Птица",
  "Дом",
  "Небо",
  "Камень",
  "Свет",
];

export default function Home() {
  const [step, setStep] = useState<"start" | "gender" | "images">("start");
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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

  if (step === "images") {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 py-12 text-zinc-950">
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Выбери 3 образа, которые сейчас откликаются
          </h1>
          <div className="mt-10 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {imageCards.map((image) => {
              const isSelected = selectedImages.includes(image);

              return (
                <button
                  key={image}
                  type="button"
                  onClick={() => toggleImage(image)}
                  className={`min-h-32 rounded-2xl border px-6 py-8 text-xl font-medium shadow-sm transition-colors ${
                    isSelected
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400"
                  }`}
                >
                  {image}
                </button>
              );
            })}
          </div>
          {selectedImages.length === 3 ? (
            <button
              type="button"
              className="mt-10 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7]"
            >
              Дальше
            </button>
          ) : null}
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
              onClick={() => setStep("images")}
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
          width={120}
          height={130}
          priority
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
