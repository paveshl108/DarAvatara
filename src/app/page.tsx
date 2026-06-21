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
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] py-10 text-zinc-950">
        <section className="flex w-full flex-col items-center text-center">
          <h1 className="max-w-sm px-6 text-xl font-medium leading-7 tracking-tight text-zinc-800 sm:max-w-xl sm:text-2xl">
            Выбери 3 образа, которые сейчас откликаются
          </h1>
          <div className="mt-8 flex w-full snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 sm:gap-6 sm:px-10">
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
                  className={`relative aspect-[3/4] w-[78vw] max-w-[360px] flex-none snap-center overflow-hidden rounded-[28px] bg-white shadow-[0_18px_50px_rgba(24,24,27,0.12)] ring-1 transition sm:w-[320px] ${
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
              className="mt-10 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7]"
            >
              Далее
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
