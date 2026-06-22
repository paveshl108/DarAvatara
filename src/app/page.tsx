"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

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
  "Человек перехода",
];

type ChoiceImage = (typeof choiceImages)[number];
type Gender = "male" | "female" | null;
type SavedMetagraphResult = {
  id: string;
  created_at?: string;
  name?: string | null;
  gender?: string | null;
  role?: string | null;
  daimon?: string | null;
  artifact?: string | null;
  key_phrase?: string | null;
  source?: string | null;
  analysis_text?: string | null;
  image_url?: string | null;
  selected_images?: unknown;
  answers?: unknown;
};
type MovementProgressRecord = {
  id?: string;
  current_step?: number;
  steps?: MovementStep[];
  completed_steps?: string[];
  notes?: MovementEntry[];
  diary?: MovementEntry[];
};
type MovementStep = {
  id: string;
  title: string;
  description: string;
  task: string;
  status: "locked" | "active" | "completed";
};
type MovementEntry = {
  id: string;
  type?: string;
  text?: string;
  stepId: string;
  createdAt: string;
};
type MovementContext = {
  resultId: string | null;
  name: string;
  analysisText: string;
  imageUrl: string | null;
  role: string | null;
  source: string | null;
  returnTo: "result" | "saved" | "dashboard";
};
type PostTypingTab = "home" | "metagraph" | "path" | "tasks" | "profile";

const postTypingTabs: { id: PostTypingTab; label: string }[] = [
  { id: "home", label: "Главная" },
  { id: "metagraph", label: "Метаграф" },
  { id: "path", label: "Путь" },
  { id: "tasks", label: "Задания" },
  { id: "profile", label: "Профиль" },
];

const genderLabels: Record<Exclude<Gender, null>, string> = {
  male: "Мужчина",
  female: "Женщина",
};

function formatName(value: string) {
  const trimmedName = value.trim();

  if (!trimmedName) {
    return "Метаграф";
  }

  return trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
}

function SmallLogo() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2">
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

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed left-4 top-4 z-40 rounded-full border border-black/10 bg-[#F7F7F7]/90 px-4 py-3 text-sm font-medium text-[#111111] shadow-[0_10px_30px_rgba(17,17,17,0.08)] backdrop-blur transition hover:bg-white sm:left-6 sm:top-6"
    >
      ← Назад
    </button>
  );
}

function ProfileButton({
  email,
  onClick,
}: {
  email?: string | null;
  onClick: () => void;
}) {
  const profileLetter = email?.trim().charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Профиль"
      className="fixed right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/80 text-sm font-semibold text-[#111111] shadow-sm backdrop-blur transition hover:bg-white sm:right-6 sm:top-6"
    >
      {profileLetter ? (
        <span>{profileLetter}</span>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M5 20c1.4-3.2 4-5 7-5s5.6 1.8 7 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )}
    </button>
  );
}

function AppTabIcon({ tab }: { tab: PostTypingTab }) {
  if (tab === "home") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 11.5 12 5l8 6.5V20H4v-8.5Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (tab === "metagraph") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }

  if (tab === "path") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 18c4-1 2-11 7-11 3 0 3 4 6 3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <circle cx="6" cy="18" r="2" fill="currentColor" />
        <circle cx="19" cy="10" r="2" fill="currentColor" />
      </svg>
    );
  }

  if (tab === "tasks") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20c1.4-3.2 4-5 7-5s5.6 1.8 7 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BottomNavigation({
  activeTab,
  onChange,
}: {
  activeTab: PostTypingTab;
  onChange: (tab: PostTypingTab) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto h-[74px] border-t border-black/10 bg-white/85 px-2 pb-2 pt-2 shadow-[0_-14px_40px_rgba(17,17,17,0.08)] backdrop-blur-xl sm:max-w-[520px] sm:rounded-t-[28px] sm:border-x">
      <div className="mx-auto grid h-full max-w-[520px] grid-cols-5 gap-1">
        {postTypingTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium transition ${
                isActive
                  ? "bg-[#85DCF6]/20 text-[#111111]"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <span className={isActive ? "text-[#28BFEA]" : ""}>
                <AppTabIcon tab={tab.id} />
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DaimonOrb() {
  return (
    <div className="relative mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-zinc-950 shadow-[0_28px_90px_rgba(17,17,17,0.28)]">
      <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(133,220,246,0.95),rgba(213,255,93,0.48)_36%,rgba(148,88,255,0.38)_64%,transparent_72%)] blur-sm" />
      <div className="absolute h-32 w-32 rounded-full border border-white/45 blur-[1px]" />
      <div className="absolute h-24 w-44 rotate-45 rounded-full border border-[#85DCF6]/50" />
      <div className="absolute h-20 w-40 -rotate-45 rounded-full border border-lime-200/50" />
      <div className="relative h-12 w-12 rounded-full bg-white/90 shadow-[0_0_48px_rgba(255,255,255,0.9)]" />
    </div>
  );
}

function MetagraphAboutContent() {
  return (
    <div className="mt-8 space-y-4 text-[16px] leading-[1.72] text-[#111111]/82 sm:mt-10 sm:space-y-5 sm:text-[18px] sm:leading-[1.75] [&_strong]:font-bold [&_strong]:text-[#111111]">
      <p>
        Метаграф — авторская система Татьяны Шайн для{" "}
        <strong>
          глубокой распаковки человека, его роли, силы и следующего уровня
          проявления
        </strong>
        .
      </p>
      <p>
        Это не обычный тест, не коучинг и не поверхностная упаковка личного
        бренда. Метаграф помогает увидеть человека как <strong>живую систему</strong>:
        его внутреннее устройство, сильные стороны, скрытые ограничения,
        природный вектор, образы, смыслы и тот этап, в который он уже готов
        перейти.
      </p>
      <p>
        Сегодня людей всё меньше выбирают только по регалиям. На первый план
        выходит <strong>экономика резонанса</strong>: когда человек чувствует —
        “мне сюда”, “меня здесь понимают”, “этому человеку я доверяю”.
      </p>
      <p>
        Метаграф помогает достать <strong>настоящую силу человека</strong> и
        перевести её в ясную форму: роль, образ, подачу, продукт, проект,
        контент, личный бренд или новый жизненный маршрут.
      </p>
      <p>
        Мы разбираем не только то, чем человек занимается сейчас, а то,{" "}
        <strong>кем он становится</strong>.
      </p>
      <p>
        Какая роль в нём считывается. Какая аудитория ему доверяет. Через что он
        может проявляться естественно. Какие темы, форматы, продукты и действия
        ведут его на следующий уровень.
      </p>
      <p>
        Отдельная часть Метаграфа — работа с{" "}
        <strong>образами, символами и артефактами</strong>. Потому что человек
        запоминает не только пользу. Он запоминает ощущение: кто перед ним, в
        чём его сила и почему к нему хочется вернуться.
      </p>
      <p>
        В результате появляется не просто описание личности, а{" "}
        <strong>карта перехода</strong>: от разрозненности — к ясности, от
        сомнений — к точности, от старого образа — к новому этапу.
      </p>
      <p>
        Метаграф не заставляет становиться кем-то другим. Он помогает увидеть,{" "}
        <strong>кем вы уже становитесь</strong> — и как этому новому уровню
        наконец дать форму.
      </p>
      <div className="mt-8 text-[17px] leading-[1.65] text-[#111111] sm:mt-10 sm:text-[20px]">
        <p>Метаграф — это не про то, чтобы придумать себя заново.</p>
        <p className="mt-2">
          Это про то, чтобы <strong>узнать себя глубже и проявиться точнее</strong>.
        </p>
      </div>
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
    title: `${formatName(name)}, ваш Метаграф собран`,
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

function generateFallbackResult({
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
  const [firstChoice, secondChoice, thirdChoice] = selectedChoices;
  const allTags = selectedChoices.flatMap((image) => image.tags);
  const uniqueTags = Array.from(new Set(allTags));
  const answerSummary = answers.filter(Boolean).join("; ");
  const answerText = answerSummary.toLowerCase();
  const userName = formatName(name);
  const genderTone =
    gender === "male"
      ? "в вашем мужском способе собирать силу"
      : gender === "female"
        ? "в вашем женском способе слышать себя"
        : "в вашем личном способе проходить этот этап";
  // Главное правило Метаграфа: картинки дают образный слой, ответы пользователя дают живую реальность. Разбор должен соединять оба слоя.
  const themes = {
    money: /деньг|финанс|доход|заработ|оплат|свобод/.test(answerText),
    tension: /напряж|стресс|зажат|давлен/.test(answerText),
    smoking: /кур|сигар|никотин/.test(answerText),
    manifestation: /прояв|видим|заяв|показ|публич/.test(answerText),
    movement: /движ|впер[её]д|шаг|идти|начать/.test(answerText),
    fear: /страш|бою|страх|опас/.test(answerText),
    tiredness: /устал|энерг|сил|выгор|истощ/.test(answerText),
    relationships: /отнош|любов|партн|семь|близ/.test(answerText),
    body: /тело|здоров|сон|еда|дых|живот|сердц/.test(answerText),
    publicity: /публич|аудитор|люд|видим/.test(answerText),
    project: /проект|дело|работ|бизнес|иде/.test(answerText),
    confidence: /увер|получится|смогу|справ/.test(answerText),
    change: /измен|переход|нов/.test(answerText),
  };
  const foundThemeLabels = [
    themes.money ? "деньги" : null,
    themes.tension ? "напряжение" : null,
    themes.smoking ? "курение" : null,
    themes.manifestation ? "проявленность" : null,
    themes.movement ? "движение" : null,
    themes.fear ? "страх" : null,
    themes.tiredness ? "усталость" : null,
    themes.relationships ? "отношения" : null,
    themes.body ? "тело" : null,
    themes.publicity ? "публичность" : null,
    themes.project ? "проект" : null,
    themes.confidence ? "«всё получится»" : null,
    themes.change ? "изменения" : null,
  ].filter(Boolean);
  const userWords =
    foundThemeLabels.length > 0
      ? foundThemeLabels.join(", ")
      : answerSummary || "поиск ясности, внутреннее движение, важный следующий шаг";
  const brandedThemeLanguage = [
    themes.money ? "деньги здесь звучат как внешний маркер свободы, обмена и права выбирать" : null,
    themes.tension ? "напряжение становится зоной утечки энергии" : null,
    themes.smoking ? "курение читается как быстрый способ разрядки напряжения, а не как повод себя обвинять" : null,
    themes.manifestation ? "проявленность открывает порог проявления: выход из внутренней тени в живую форму" : null,
    themes.fear ? "страх работает как защитный контур" : null,
    themes.movement ? "движение вперёд показывает активный внутренний вектор" : null,
    themes.tiredness ? "усталость похожа на сигнал тела о необходимости пересборки" : null,
    themes.relationships ? "отношения подсвечивают контур движения через близость и границы" : null,
    themes.body ? "тело становится точкой сборки, а не фоном" : null,
    themes.confidence ? "«всё получится» звучит как скрытая вера в свою силу" : null,
  ].filter(Boolean);
  const moneyMeaning = themes.money
    ? "Вы называете деньги, и в языке Метаграфа это не только финансы. Это внешний маркер свободы, обмена, проявленности и права выбирать: знак того, что живой импульс хочет стать не мыслью, а формой, действием и честным обменом."
    : "Даже если внешний запрос пока не назван одним словом, за ним чувствуется желание более честного обмена с жизнью: меньше распыления, больше ясности, живой формы и собственного места.";
  const regulationMeaning =
    themes.tension || themes.smoking || themes.tiredness || themes.body
      ? `В ответах слышны темы ${[
          themes.tension ? "напряжения" : null,
          themes.smoking ? "курения" : null,
          themes.tiredness ? "усталости" : null,
          themes.body ? "тела" : null,
        ]
          .filter(Boolean)
          .join(", ")}. В языке Метаграфа это зона утечки энергии: накопленная сила ищет быстрый способ разрядки, а телу и нервному ритму нужна не жёсткость, а мягкая дисциплина и опора действия.`
      : "В ответах нет необходимости искать проблему: важнее заметить, где внутренний вектор просит живой формы, а не очередного усилия через силу.";
  const transitionMeaning =
    themes.manifestation || themes.movement || themes.smoking
      ? `Вы прямо указываете на ${[
          themes.manifestation ? "проявленность" : null,
          themes.movement ? "движение вперёд" : null,
          themes.smoking ? "желание изменить привычку курения" : null,
        ]
          .filter(Boolean)
          .join(", ")}. Это делает точку перехода очень конкретной: не просто «измениться», а начать переводить накопленную энергию в действие, видимость, первый след и новый способ обходиться с напряжением.`
      : "Точка перехода связана с тем, что вы уже чувствуете важность шага, но часть вас ещё ждёт более безопасного момента. Это порог проявления: старая роль уже тесна, а новая ещё собирает форму.";
  const confidenceMeaning = themes.confidence
    ? "Фраза про то, что «всё получится», звучит как скрытая вера в свою силу. Её сложно признать полностью, потому что тогда придётся заключить новый внутренний контракт: больше действия, меньше отступления, больше права на собственную роль проявления."
    : "Скрытая тяга здесь не кричит. Она проявляется в том, что вы уже способны назвать важные темы и выдержать честный взгляд на них.";

  const tagCount = (tags: string[]) =>
    tags.reduce((score, tag) => score + allTags.filter((item) => item === tag).length, 0);
  const scoredArchetypes = [
    {
      name: themes.money && themes.manifestation ? "Проводник проявленности" : "Проводник",
      score: tagCount(["знак", "поиск", "выбор", "глубина"]) + (themes.manifestation ? 2 : 0),
    },
    { name: "Наблюдатель", score: tagCount(["наблюдение", "ум", "дистанция", "контроль"]) },
    {
      name: "Творец",
      score: tagCount(["рост", "радость", "проявленность", "игра"]) + (themes.project ? 2 : 0),
    },
    { name: "Хранитель", score: tagCount(["тепло", "сердце", "любовь", "близость"]) },
    { name: "Искатель", score: tagCount(["поиск", "сомнение", "неясность", "вопрос"]) },
    { name: "Мечтатель", score: tagCount(["мечта", "пауза", "отдых", "зависание"]) },
    {
      name: themes.money && themes.manifestation ? "Игрок-Проводник" : "Игрок",
      score: tagCount(["юмор", "абсурд", "лёгкость", "социальность"]) + (themes.money ? 1 : 0),
    },
    { name: "Собирающий себя", score: tagCount(["границы", "тело", "тишина", "уязвимость"]) },
    {
      name: "Человек перехода",
      score: tagCount(["выбор", "неясность", "границы", "рост"]) + (themes.change || themes.movement ? 2 : 0),
    },
  ];
  const archetype =
    scoredArchetypes.sort((first, second) => second.score - first.score)[0]?.name ??
    "Собирающий себя";
  const daemonVector = uniqueTags.includes("проявленность")
    ? "перевести порог проявления в живую форму: проявлять себя видимо, но без насилия над собственной чувствительностью"
    : uniqueTags.includes("наблюдение") || uniqueTags.includes("интеллект")
      ? "переводить наблюдение, внутреннюю ясность и образ силы в живое действие"
      : uniqueTags.includes("тепло") || uniqueTags.includes("сердце")
        ? "строить контур движения через контакт, тепло и бережную близость"
        : uniqueTags.includes("пауза") || uniqueTags.includes("мечта")
          ? "дать мечте живую форму, ритм и первый след"
          : "собрать разрозненные ощущения в понятный внутренний вектор";
  const limitation = themes.tension && themes.smoking
    ? "мешать может не слабость, а тень силы: накопленное напряжение ищет быстрый способ разрядки через привычное действие, вместо того чтобы получить живую форму"
    : themes.fear
      ? "часть вас уже видит направление, но защитный контур удерживает от резкого шага через осторожность и сомнение"
      : themes.tiredness
        ? "внутри может быть не отсутствие желания, а зона утечки энергии: усталость от лишних расходов и попыток держать слишком многое одновременно"
        : answerText.match(/не знаю|непонят|потер/)
        ? "защитой сейчас может быть ожидание полной ясности, хотя первый след может появиться раньше, чем окончательный ответ"
        : "ограничение похоже не на слабость, а на привычку сначала всё понять и только потом разрешить себе контур движения";
  const artifact = themes.manifestation
    ? "дневник порога проявления: маленькая карточка или заметка с вопросом «что я сегодня готов показать миру хотя бы на 1%?»"
    : themes.money
      ? "жетон первого обмена: небольшой предмет, который напоминает, что деньги здесь связаны с правом проявляться, выбирать и вступать в честный обмен"
      : uniqueTags.includes("тишина")
    ? "маленький дневник тишины: одна страница, куда вы записываете не планы, а живой импульс, который действительно отзывается"
    : uniqueTags.includes("игра") || uniqueTags.includes("юмор")
      ? "карточка роли проявления с фразой «я могу пробовать легче» — как разрешение не превращать каждый шаг в экзамен"
      : uniqueTags.includes("тело")
        ? "жест ладонью к груди или к животу: короткое напоминание вернуться в тело как в точку сборки перед важным решением"
        : "личный знак перехода: простая фраза или предмет, который напоминает, что внутренний вектор уже начал собираться";
  const task = themes.smoking && themes.manifestation
    ? "в ближайшие 24–72 часа вместо одной привычной сигареты сделайте паузу на 3 минуты и запишите: «что я сейчас хочу проявить, но сдерживаю?» Затем оставьте первый след: сообщение, заметку, звонок, публикацию или разговор"
    : themes.fear
      ? "в течение ближайших 24–72 часов сделайте первый след в сторону того, что страшно: напишите сообщение, откройте документ, назовите желание вслух или обозначьте границу"
      : themes.tiredness
        ? "в ближайшие 24–72 часа уберите один источник утечки энергии и освободите для себя хотя бы полчаса без компенсации и чувства долга"
        : "в ближайшие 24–72 часа выберите один первый след на 15 минут и выполните его не ради результата, а ради возвращения движения";
  const answerLayer = answerSummary
    ? `В ваших ответах звучит живая реальность: ${answerSummary}. Я не читаю это как набор отдельных фраз. В них виден ключевой узел: ${userWords}. ${brandedThemeLanguage.length > 0 ? brandedThemeLanguage.join(". ") + "." : ""}`
    : `В ответах пока важнее не конкретная формулировка, а сам факт движения: вы уже дошли до точки сборки, где хочется увидеть себя точнее.`;
  const firstImageLine = firstChoice
    ? `${firstChoice.name} несёт теги ${firstChoice.tags.join(", ")}`
    : "первый образ держит главный импульс";
  const secondImageLine = secondChoice
    ? `${secondChoice.name} несёт теги ${secondChoice.tags.join(", ")}`
    : "второй образ показывает внутреннюю потребность";
  const thirdImageLine = thirdChoice
    ? `${thirdChoice.name} несёт теги ${thirdChoice.tags.join(", ")}`
    : "третий образ показывает точку перехода";
  const keyPhrase = themes.money && themes.manifestation
    ? "Моя проявленность может стать живой формой, а мой обмен — правом выбирать."
    : themes.smoking && (themes.tension || themes.body)
      ? "Я могу вернуть напряжению живую форму, а себе — опору действия."
      : themes.fear && themes.movement
        ? "Я могу идти через защитный контур и оставить первый след."
        : themes.tiredness
          ? "Я возвращаю энергию в точку сборки и выбираю мягкую дисциплину."
          : "Я могу двигаться мягко, но по-настоящему, оставляя первый след.";

  return `${userName}, ваш Метаграф собран

Главный зов
Первая выбранная картинка — ${firstChoice?.name ?? "образ"} — показывает Главный зов: то, что сейчас сильнее всего притягивает ваше внимание. ${firstImageLine}. Это не обязательно прямая цель. Скорее, это скрытая тяга, рядом с которой внутренний шум становится различимее: видно, куда вас тянет и какой слой жизни просит живой формы.

${answerLayer} Главный зов поэтому связан не только с картинкой, но и с тем, что вы сами назвали. ${moneyMeaning} В вашем выборе считывается движение ${genderTone}: не отвлечённая мечта, а попытка найти точку, где внутренняя энергия сможет стать действием, обменом, видимостью или спокойной уверенностью.

Этот образ говорит не о том, кем вы обязаны стать, а о том, что сейчас хочет проявиться. Если в ответах есть деньги, движение, проект, проявленность или желание, чтобы “всё получилось”, Главный зов показывает: вам нужен не абстрактный успех, а контур движения, где вы перестаёте прятать живой импульс и начинаете обращаться с ним как с реальной силой.

Внутренняя потребность
Вторая выбранная картинка — ${secondChoice?.name ?? "образ"} — раскрывает внутренний вектор потребности. ${secondImageLine}. Здесь речь не о внешнем результате, а о том, какая часть вас просит внимания: та, которой нужно тепло, ясность, признание, движение или право на паузу.

${regulationMeaning} Если рядом с этим есть тема проявленности, денег, отношений или публичности, внутренняя потребность звучит так: вам важно не только выйти наружу, но и не потерять себя в этом выходе. Не доказать что-то миру любой ценой, а найти роль проявления, где можно быть видимым без внутреннего сжатия.

Эта потребность может быть тихой, но она важна, потому что без неё Главный зов превращается в напряжение. Если внутри уже есть усталость, привычка быстро сбрасывать напряжение или ощущение, что тело тащит больше, чем хочется признавать, Метаграф показывает: ваша опора действия сейчас начинается не с контроля, а с более честной сборки себя.

Точка перехода
Третья выбранная картинка — ${thirdChoice?.name ?? "образ"} — обозначает точку перехода. ${thirdImageLine}. Это место, где может быть сопротивление, тень или страх сделать следующий шаг. Но именно здесь чаще всего скрыта дверь.

${transitionMeaning} Точка перехода не требует резкого рывка. Она показывает, где старая стратегия уже стала тесной: ждать полной ясности, собирать ещё подтверждения, откладывать публичность, привычно разряжать напряжение или держать своё движение в тени.

Здесь важно увидеть сопротивление не как проблему, а как тень силы: часть вашей энергии уже готова идти дальше, но пока стоит у порога проявления. С этим можно договориться: не ломать старый способ, а дать ему новую роль — охранять темп, но больше не отменять движение.

Ваш предварительный образ
Ваш образ силы сейчас ближе к архетипу «${archetype}». Он складывается из повторяющихся оттенков: ${uniqueTags.slice(0, 10).join(", ")} — и из ваших собственных слов: ${userWords}. В этом образе есть ваша текущая сила: не абстрактный потенциал, а конкретный способ собирать себя в моменте.

${confidenceMeaning} Этот архетип показывает, что сейчас вы не стоите на месте. Вы находитесь в процессе сборки себя: что-то уже стало прежним, а новое ещё требует языка, формы и первого следа. Ваша сила — в способности замечать нюансы и не предавать внутреннюю правду ради быстрых ответов.

Даймон
Ваш Даймон сейчас направлен на то, чтобы ${daemonVector}. Это не мистика и не внешнее предназначение. Это глубинный внутренний вектор: куда вас тянет тогда, когда вы перестаёте подстраиваться под шум и начинаете слышать собственное движение.

Если в ответах звучат деньги, это не сводится к сумме. Деньги здесь могут быть внешним маркером того, что пора входить в обмен: проявлять форму, голос, результат, право занимать место. Если звучит проявленность, Даймон ведёт не к демонстративности, а к ясному присутствию. Если звучит напряжение или усталость, внутренний вектор начинается с возвращения энергии себе.

Похоже, вам важно не просто решить отдельный вопрос, а перейти в более точную роль проявления. Такую, где ваши чувства, ум, тело и опыт не спорят друг с другом, а начинают работать как одна система.

Что может мешать
Мешать может то, что ${limitation}. Это не недостаток. Это защитный механизм, который когда-то помогал не ошибиться, не раскрыться слишком рано или не потерять контроль.

Сейчас этот механизм можно не ломать, а смягчать. Не требовать от себя мгновенной смелости, а создавать условия, в которых движение становится безопаснее. Если напряжение просит быстрой разрядки, важно не стыдить себя, а спросить: какую энергию я сейчас не выпускаю в действие? Если страх удерживает от проявления, важно не спорить со страхом, а превратить защитный контур в опору действия.

Артефакт перехода
Ваш артефакт перехода: ${artifact}. Он нужен не как украшение, а как якорь. Когда внимание распадается или появляется сомнение, этот символ может возвращать вас к главному вектору.

Пусть это будет простой знак, который не требует объяснений другим. Его задача — напоминать вам: выбранное направление уже существует, даже если живая форма пока собирается медленно.

Задание для перехода
Ваше действие на ближайшие 24–72 часа: ${task}. Сделайте его достаточно маленьким, чтобы не пришлось преодолевать себя целиком. Сейчас важен не большой рывок, а первый след — действие, после которого внутренний вектор перестаёт быть мыслью и становится движением.

После этого не оценивайте себя строго. Просто отметьте, что изменилось в теле, настроении и ощущении направления. Метаграф здесь не просит доказательств. Он предлагает увидеть движение там, где раньше было только ожидание, напряжение или привычный откат.

Фраза-ключ
${keyPhrase}`;
}

function escapeSvgText(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function generateMetagraphImage({
  name,
  metagraphResult,
}: {
  name: string;
  metagraphResult: ReturnType<typeof generateMetagraphResult>;
}) {
  const title = escapeSvgText(formatName(name));
  const archetype = escapeSvgText(metagraphResult.archetype.title);
  const firstImage = metagraphResult.imageBlocks[0]?.image.name ?? "Главный зов";
  const secondImage =
    metagraphResult.imageBlocks[1]?.image.name ?? "Внутренняя потребность";
  const thirdImage = metagraphResult.imageBlocks[2]?.image.name ?? "Точка перехода";
  const tags = Array.from(
    new Set(
      metagraphResult.imageBlocks.flatMap((block) => block.image.tags).slice(0, 8),
    ),
  );

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F7F7F7"/>
      <stop offset="46%" stop-color="#ECE7DF"/>
      <stop offset="100%" stop-color="#D8D3C8"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="58%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.92"/>
      <stop offset="58%" stop-color="#F7F7F7" stop-opacity="0.52"/>
      <stop offset="100%" stop-color="#BEB7AA" stop-opacity="0.12"/>
    </radialGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="28" stdDeviation="38" flood-color="#18181B" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="1080" height="1440" fill="url(#bg)"/>
  <circle cx="540" cy="508" r="420" fill="url(#glow)"/>
  <g filter="url(#softShadow)">
    <rect x="156" y="142" width="768" height="1156" rx="64" fill="#FDFCF9" opacity="0.82"/>
  </g>
  <circle cx="540" cy="486" r="245" fill="none" stroke="#18181B" stroke-width="2" opacity="0.42"/>
  <circle cx="540" cy="486" r="156" fill="none" stroke="#18181B" stroke-width="1.5" opacity="0.32"/>
  <path d="M540 246 C626 362 664 432 540 726 C416 432 454 362 540 246Z" fill="#18181B" opacity="0.055"/>
  <path d="M334 646 C458 578 622 578 746 646" fill="none" stroke="#18181B" stroke-width="3" opacity="0.22"/>
  <path d="M392 760 C480 716 600 716 688 760" fill="none" stroke="#18181B" stroke-width="2" opacity="0.2"/>
  <text x="540" y="240" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" fill="#52525B" letter-spacing="8">МЕТАГРАФ</text>
  <text x="540" y="360" text-anchor="middle" font-family="Georgia, serif" font-size="72" fill="#18181B">${title}</text>
  <text x="540" y="440" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" fill="#3F3F46">${archetype}</text>
  <text x="540" y="886" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" fill="#18181B">Главный зов — ${escapeSvgText(firstImage)}</text>
  <text x="540" y="944" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" fill="#18181B">Потребность — ${escapeSvgText(secondImage)}</text>
  <text x="540" y="1002" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" fill="#18181B">Переход — ${escapeSvgText(thirdImage)}</text>
  <text x="540" y="1120" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="26" fill="#71717A">${escapeSvgText(tags.join(" · "))}</text>
  <line x1="310" y1="1194" x2="770" y2="1194" stroke="#18181B" stroke-width="1.5" opacity="0.18"/>
  <text x="540" y="1258" text-anchor="middle" font-family="Georgia, serif" font-size="32" fill="#3F3F46">сейчас в вас проявлено движение к себе</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function extractResultSection(resultText: string, sectionTitle: string) {
  const startIndex = resultText.indexOf(sectionTitle);

  if (startIndex === -1) {
    return null;
  }

  const sectionStart = startIndex + sectionTitle.length;
  const rest = resultText.slice(sectionStart).trim();
  const nextSectionMatch = rest.match(/\n\n[А-ЯЁ][^\n]{2,80}\n/);
  const sectionText = nextSectionMatch
    ? rest.slice(0, nextSectionMatch.index).trim()
    : rest.trim();

  return sectionText || null;
}

function getMovementThemes(text: string) {
  const lowerText = text.toLowerCase();

  return {
    money: /деньг|финанс|доход|заработ|обмен|ценност/.test(lowerText),
    tension: /напряж|стресс|зон[аы] утечки|зажат/.test(lowerText),
    smoking: /кур|сигар|никотин/.test(lowerText),
    manifestation: /прояв|публич|видим|сторис|публикац/.test(lowerText),
    movement: /движ|вектор|шаг|идти|переход/.test(lowerText),
    fear: /страх|страш|бою|защитный контур/.test(lowerText),
    tiredness: /устал|энерг|сил|пересбор/.test(lowerText),
    relationships: /отнош|контакт|довер|сообщен|близ/.test(lowerText),
  };
}

function inferMovementRole(resultText: string) {
  const lowerText = resultText.toLowerCase();

  if (/игрок|игра|прояв/.test(lowerText)) {
    return "Игрок-Проводник";
  }

  if (/наблюд|тишин|след/.test(lowerText)) {
    return "Наблюдатель перехода";
  }

  if (/твор|создан|образ|форма/.test(lowerText)) {
    return "Творец формы";
  }

  if (/хранител|тепл|забот|опор/.test(lowerText)) {
    return "Хранитель опоры";
  }

  return "Человек перехода";
}

function generateMovementSteps(resultText: string, answers: string[] = []) {
  const themes = getMovementThemes(`${resultText} ${answers.join(" ")}`);
  const smokingTask =
    "Перед одной привычной сигаретой сделайте паузу 3 минуты и запишите: что я сейчас хочу проявить, но сдерживаю?";
  const publicTask =
    "Оставьте маленький видимый след: сторис, сообщение, заметку, короткую мысль или предложение.";
  const exchangeTask =
    "Назовите одну ценность, которую вы готовы предложить миру, и один простой формат обмена.";

  const steps: MovementStep[] = [
    {
      id: "tension",
      title: "Увидеть точку напряжения",
      description: themes.tension
        ? "Заметить зону утечки энергии: где сила уходит в сомнения, перегруз, привычную разрядку или ожидание идеального момента."
        : "Заметить, где энергия сейчас утекает: в сомнения, откладывание, перегруз, привычную разрядку или ожидание идеального момента.",
      task: themes.smoking
        ? smokingTask
        : "Запишите одну честную фразу: куда сейчас утекает моя энергия?",
      status: "active",
    },
    {
      id: "body",
      title: "Вернуть энергию в тело",
      description: themes.tiredness
        ? "Усталость здесь похожа на сигнал тела о необходимости пересборки, а не на отсутствие силы."
        : "Собрать опору через маленькое действие, паузу, дыхание, дневник или честное признание того, что происходит.",
      task: "Сделайте паузу на 3 минуты, выдохните и запишите: что телу сейчас нужно вернуть себе?",
      status: "locked",
    },
    {
      id: "first-trace",
      title: "Оставить первый след",
      description: themes.movement
        ? "Сделать маленький видимый шаг, чтобы внутренний вектор перестал быть мыслью и стал движением."
        : "Сделать маленький видимый шаг, после которого внутренний вектор перестаёт быть мыслью и становится движением.",
      task: themes.manifestation ? publicTask : "Сделайте одно действие на 10 минут без требования результата.",
      status: "locked",
    },
    {
      id: "soft-manifestation",
      title: "Проявиться без давления",
      description: themes.fear
        ? "Показать себя в мягкой форме, не споря с защитным контуром и не требуя от себя идеальности."
        : "Показать себя, идею, мысль, предложение или действие в мягкой форме, без требования сразу быть идеальным.",
      task: themes.relationships
        ? "Отправьте одно честное сообщение человеку, с которым давно хотели связаться."
        : publicTask,
      status: "locked",
    },
    {
      id: "role",
      title: "Собрать роль",
      description: "Увидеть, какая роль сейчас проявляется: Проводник, Игрок, Творец, Хранитель, Наблюдатель или Человек перехода.",
      task: "Напишите три слова о роли, в которой вам сейчас легче действовать без маски.",
      status: "locked",
    },
    {
      id: "exchange",
      title: "Сделать обмен",
      description: themes.money
        ? "Перевести проявленность в обмен, ценность и право выбирать."
        : "Перевести проявленность в контакт с миром: разговор, предложение, публикацию, продукт, услугу, встречу или первый обмен.",
      task: themes.money ? exchangeTask : "Сделайте один маленький контакт с миром: разговор, предложение или публикацию.",
      status: "locked",
    },
    {
      id: "new-contour",
      title: "Закрепить новый контур",
      description: "Зафиксировать новый способ действия, чтобы он стал не случайным рывком, а частью новой сборки.",
      task: "Запишите, какой новый контур действия вы хотите повторить завтра.",
      status: "locked",
    },
  ];

  return steps;
}

function getDecoratedMovementSteps(
  steps: MovementStep[],
  completedSteps: string[],
  currentStep: number,
): MovementStep[] {
  return steps.map((movementStep, index) => ({
    ...movementStep,
    status: completedSteps.includes(movementStep.id)
      ? "completed"
      : index === currentStep
        ? "active"
        : "locked",
  }));
}

export default function Home() {
  const [step, setStep] = useState<
    | "start"
    | "gender"
    | "name"
    | "images"
    | "questions"
    | "result"
    | "returningDashboard"
    | "postTypingApp"
    | "transitionMap"
  >("start");
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);
  const [name, setName] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [downloadHint, setDownloadHint] = useState("");
  const [resultDownloadHint, setResultDownloadHint] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authStep, setAuthStep] = useState<"email" | "code">("email");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMyMetagraphOpen, setIsMyMetagraphOpen] = useState(false);
  const [savedResults, setSavedResults] = useState<SavedMetagraphResult[]>([]);
  const [savedResultsLoading, setSavedResultsLoading] = useState(false);
  const [openedSavedResult, setOpenedSavedResult] =
    useState<SavedMetagraphResult | null>(null);
  const [movementContext, setMovementContext] = useState<MovementContext | null>(null);
  const [movementProgressId, setMovementProgressId] = useState<string | null>(null);
  const [movementSteps, setMovementSteps] = useState<MovementStep[]>([]);
  const [completedMovementSteps, setCompletedMovementSteps] = useState<string[]>([]);
  const [currentMovementStep, setCurrentMovementStep] = useState(0);
  const [movementNotes, setMovementNotes] = useState<MovementEntry[]>([]);
  const [movementDiary, setMovementDiary] = useState<MovementEntry[]>([]);
  const [movementDiaryText, setMovementDiaryText] = useState("");
  const [movementMessage, setMovementMessage] = useState("");
  const [returningResult, setReturningResult] =
    useState<SavedMetagraphResult | null>(null);
  const [returningProgress, setReturningProgress] =
    useState<MovementProgressRecord | null>(null);
  const [returningChecked, setReturningChecked] = useState(false);
  const [postTypingTab, setPostTypingTab] = useState<PostTypingTab>("home");
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
  const fallbackResult = useMemo(
    () =>
      generateFallbackResult({
        name,
        gender: selectedGender,
        selectedImageIds: selectedImages,
        answers,
      }),
    [answers, name, selectedGender, selectedImages],
  );
  const analysisText = aiResult && !analysisFailed ? aiResult : fallbackResult;
  const analysisSource = aiResult && !analysisFailed ? "ai" : "fallback";
  const profileEmail = user?.email ?? session?.user.email ?? null;
  const selectedImageDetails = useMemo(
    () =>
      selectedImages
        .map((imageId, index) => {
          const image = choiceImages.find((choiceImage) => choiceImage.id === imageId);

          if (!image) {
            return null;
          }

          return {
            order: index + 1,
            role: imageRoles[index]?.title ?? `Образ ${index + 1}`,
            id: image.id,
            name: image.name,
            tags: image.tags,
          };
        })
        .filter(Boolean),
    [selectedImages],
  );
  const buildMetagraphPayload = useCallback(
    (userId: string) => ({
      user_id: userId,
      name: formatName(name),
      gender: selectedGender,
      selected_images: selectedImageDetails.map((image) => ({
        id: image?.id ?? null,
        number: image?.id ?? null,
        name: image?.name ?? null,
        title: image?.name ?? null,
        tags: image?.tags ?? [],
        order: image?.order ?? null,
      })),
      answers: questions.map((question, index) => ({
        question,
        answer: answers[index] ?? "",
        index,
      })),
      analysis_text: analysisText,
      image_prompt: null,
      image_url: generatedImageUrl || null,
      role: metagraphResult.archetype.title ?? null,
      daimon: extractResultSection(analysisText, "Даймон"),
      artifact: extractResultSection(analysisText, "Артефакт перехода"),
      key_phrase: extractResultSection(analysisText, "Фраза-ключ"),
      source: analysisSource,
    }),
    [
      analysisSource,
      analysisText,
      answers,
      generatedImageUrl,
      metagraphResult.archetype.title,
      name,
      selectedGender,
      selectedImageDetails,
    ],
  );
  const buildLocalMetagraphResult = useCallback(
    (): SavedMetagraphResult => ({
      id: savedResultId ?? "local-latest",
      created_at: new Date().toISOString(),
      name: formatName(name),
      gender: selectedGender,
      role: metagraphResult.archetype.title ?? null,
      daimon: extractResultSection(analysisText, "Даймон"),
      artifact: extractResultSection(analysisText, "Артефакт перехода"),
      key_phrase: extractResultSection(analysisText, "Фраза-ключ"),
      source: analysisSource,
      analysis_text: analysisText,
      image_url: generatedImageUrl || null,
      selected_images: selectedImageDetails,
      answers: questions.map((question, index) => ({
        question,
        answer: answers[index] ?? "",
        index,
      })),
    }),
    [
      analysisSource,
      analysisText,
      answers,
      generatedImageUrl,
      metagraphResult.archetype.title,
      name,
      savedResultId,
      selectedGender,
      selectedImageDetails,
    ],
  );
  const buildMetagraphPayloadFromSavedResult = useCallback(
    (result: SavedMetagraphResult, userId: string) => ({
      user_id: userId,
      name: result.name ?? "Метаграф",
      gender: result.gender ?? null,
      selected_images: result.selected_images ?? [],
      answers: result.answers ?? [],
      analysis_text: result.analysis_text ?? "",
      image_prompt: null,
      image_url: result.image_url ?? null,
      role: result.role ?? null,
      daimon:
        result.daimon ?? extractResultSection(result.analysis_text ?? "", "Даймон"),
      artifact:
        result.artifact ??
        extractResultSection(result.analysis_text ?? "", "Артефакт перехода"),
      key_phrase:
        result.key_phrase ??
        extractResultSection(result.analysis_text ?? "", "Фраза-ключ"),
      source: result.source ?? "local",
    }),
    [],
  );

  const insertMetagraphPayload = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!supabase) {
        throw new Error("Supabase client is not configured.");
      }

      const { data, error } = await supabase
        .from("metagraph_results")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      return data?.id as string | undefined;
    },
    [],
  );

  const savePendingMetagraphResult = useCallback(
    async (currentUser: User) => {
      if (!supabase) {
        return;
      }

      const pendingResult = window.localStorage.getItem("pendingMetagraphResult");

      if (!pendingResult) {
        return;
      }

      try {
        const pendingPayload = JSON.parse(pendingResult) as Record<string, unknown>;
        const createdId = await insertMetagraphPayload({
          ...pendingPayload,
          user_id: currentUser.id,
        });

        window.localStorage.removeItem("pendingMetagraphResult");
        setSavedResultId(createdId ?? null);
        setSaveMessage("Метаграф сохранён");

        const pendingProgress = window.localStorage.getItem("movementProgressDraft");

        if (createdId && pendingProgress && supabase) {
          const progressDraft = JSON.parse(pendingProgress) as ReturnType<
            typeof getMovementDraft
          >;
          const { data: existingProgress } = await supabase
            .from("movement_progress")
            .select("id")
            .eq("result_id", createdId)
            .maybeSingle();

          if (!existingProgress?.id) {
            await supabase.from("movement_progress").insert({
              user_id: currentUser.id,
              result_id: createdId,
              current_step: progressDraft.current_step ?? 0,
              steps: progressDraft.steps ?? [],
              completed_steps: progressDraft.completed_steps ?? [],
              notes: progressDraft.notes ?? [],
              diary: progressDraft.diary ?? [],
            });
          }

          window.localStorage.removeItem("movementProgressDraft");
        }
      } catch (error) {
        console.error("Failed to save pending Metagraph result.", error);
        setSaveMessage("Не удалось сохранить. Попробуйте ещё раз.");
      }
    },
    [insertMetagraphPayload],
  );

  const loadSavedResults = useCallback(
    async (currentUser = user) => {
      if (!supabase || !currentUser) {
        setSavedResults([]);
        return;
      }

      setSavedResultsLoading(true);

      try {
        const { data, error } = await supabase
          .from("metagraph_results")
          .select(
            "id, created_at, name, gender, role, daimon, artifact, key_phrase, source, analysis_text, image_url, selected_images, answers",
          )
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          throw error;
        }

        setSavedResults((data ?? []) as SavedMetagraphResult[]);
      } catch (error) {
        console.error("Failed to load saved Metagraph results.", error);
        setSavedResults([]);
      } finally {
        setSavedResultsLoading(false);
      }
    },
    [user],
  );

  const loadReturningDashboard = useCallback(async (currentUser: User | null) => {
    if (step !== "start") {
      setReturningChecked(true);
      return;
    }

    if (currentUser && supabase) {
      try {
        const { data: latestResult, error: resultError } = await supabase
          .from("metagraph_results")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (resultError) {
          throw resultError;
        }

        if (latestResult) {
          const savedResult = latestResult as SavedMetagraphResult;
          const { data: progressData, error: progressError } = await supabase
            .from("movement_progress")
            .select("*")
            .eq("result_id", savedResult.id)
            .maybeSingle();

          if (progressError) {
            throw progressError;
          }

          setReturningResult(savedResult);
          setReturningProgress((progressData as MovementProgressRecord | null) ?? null);
          setPostTypingTab("home");
          setStep("postTypingApp");
          setReturningChecked(true);
          return;
        }
      } catch (error) {
        console.error("Failed to load returning dashboard.", error);
      }
    }

    if (!currentUser) {
      const localResult = window.localStorage.getItem("lastMetagraphResult");

      if (localResult) {
        try {
          const parsedResult = JSON.parse(localResult) as SavedMetagraphResult;
          const localProgress = window.localStorage.getItem("movementProgressDraft");

          setReturningResult(parsedResult);
          setReturningProgress(
            localProgress
              ? (JSON.parse(localProgress) as MovementProgressRecord)
              : null,
          );
          setPostTypingTab("home");
          setStep("postTypingApp");
          setReturningChecked(true);
          return;
        } catch {
          window.localStorage.removeItem("lastMetagraphResult");
        }
      }
    }

    setReturningChecked(true);
  }, [step]);

  useEffect(() => {
    if (!supabase) {
      Promise.resolve().then(() => loadReturningDashboard(null));
      return;
    }

    let isActive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) {
        return;
      }

      const currentSession = data.session;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        savePendingMetagraphResult(currentSession.user);
      }

      loadReturningDashboard(currentSession?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        savePendingMetagraphResult(currentSession.user);
      }

      loadReturningDashboard(currentSession?.user ?? null);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [loadReturningDashboard, savePendingMetagraphResult]);

  useEffect(() => {
    if (step !== "result") {
      return;
    }

    let isActive = true;

    async function analyzeMetagraph() {
      setIsAnalyzing(true);
      setAnalysisFailed(false);
      setAiResult("");
      setGeneratedImageUrl("");
      setIsImageModalOpen(false);
      setDownloadHint("");

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gender: selectedGender,
            name: formatName(name),
            selectedImages: selectedImageDetails,
            answers: questions.map((question, index) => ({
              question,
              answer: answers[index] ?? "",
            })),
          }),
        });

        if (!response.ok) {
          throw new Error("Analysis request failed.");
        }

        const data = await response.json();

        if (!data.analysis) {
          throw new Error("Analysis response is empty.");
        }

        if (isActive) {
          setAiResult(data.analysis);
        }
      } catch (error) {
        console.error("Metagraph AI analysis failed, using fallback.", error);

        if (isActive) {
          setAnalysisFailed(true);
        }
      } finally {
        if (isActive) {
          setIsAnalyzing(false);
        }
      }
    }

    analyzeMetagraph();

    return () => {
      isActive = false;
    };
  }, [answers, name, selectedGender, selectedImageDetails, step]);

  useEffect(() => {
    if (step !== "result" || isAnalyzing || generatedImageUrl) {
      return;
    }

    const hasTextResult = Boolean(aiResult) || analysisFailed;

    if (!hasTextResult) {
      return;
    }

    const timer = window.setTimeout(() => {
      setGeneratedImageUrl(generateMetagraphImage({ name, metagraphResult }));
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [aiResult, analysisFailed, generatedImageUrl, isAnalyzing, metagraphResult, name, step]);

  useEffect(() => {
    if (step !== "result" || isAnalyzing || (!aiResult && !analysisFailed)) {
      return;
    }

    window.localStorage.setItem(
      "lastMetagraphResult",
      JSON.stringify(buildLocalMetagraphResult()),
    );

    if (!user) {
      window.localStorage.setItem(
        "pendingMetagraphResult",
        JSON.stringify(buildMetagraphPayload("pending")),
      );
    }
  }, [
    aiResult,
    analysisFailed,
    buildLocalMetagraphResult,
    buildMetagraphPayload,
    generatedImageUrl,
    isAnalyzing,
    step,
    user,
  ]);

  useEffect(() => {
    if (
      step !== "result" ||
      isAnalyzing ||
      !generatedImageUrl ||
      (!aiResult && !analysisFailed)
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setReturningResult(buildLocalMetagraphResult());
      setReturningProgress(null);
      setPostTypingTab("home");
      setStep("postTypingApp");
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    aiResult,
    analysisFailed,
    buildLocalMetagraphResult,
    generatedImageUrl,
    isAnalyzing,
    step,
  ]);

  useEffect(() => {
    if (step !== "postTypingApp" || !returningResult) {
      return;
    }

    const resultText = returningResult.analysis_text ?? "";

    if (movementContext?.analysisText === resultText && movementSteps.length > 0) {
      return;
    }

    const context: MovementContext = {
      resultId: returningResult.id ?? null,
      name: returningResult.name ?? "Метаграф",
      analysisText: resultText,
      imageUrl: returningResult.image_url ?? null,
      role: returningResult.role ?? inferMovementRole(resultText),
      source: returningResult.source ?? null,
      returnTo: "dashboard",
    };
    const baseSteps = returningProgress?.steps?.length
      ? returningProgress.steps
      : generateMovementSteps(resultText);
    const completedSteps = returningProgress?.completed_steps ?? [];
    const activeStep =
      typeof returningProgress?.current_step === "number"
        ? returningProgress.current_step
        : Math.min(completedSteps.length, Math.max(baseSteps.length - 1, 0));

    const timer = window.setTimeout(() => {
      setMovementContext(context);
      setMovementProgressId(returningProgress?.id ?? null);
      setMovementSteps(getDecoratedMovementSteps(baseSteps, completedSteps, activeStep));
      setCompletedMovementSteps(completedSteps);
      setCurrentMovementStep(activeStep);
      setMovementNotes(returningProgress?.notes ?? []);
      setMovementDiary(returningProgress?.diary ?? []);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    movementContext?.analysisText,
    movementSteps.length,
    returningProgress,
    returningResult,
    step,
  ]);

  useEffect(() => {
    if (step !== "postTypingApp" || !user) {
      return;
    }

    const timer = window.setTimeout(() => {
      loadSavedResults(user);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadSavedResults, step, user]);

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

    const nextQuestionIndex = questionIndex + 1;

    setQuestionIndex(nextQuestionIndex);
    setCurrentAnswer(nextAnswers[nextQuestionIndex] ?? "");
  };

  const saveCurrentQuestionDraft = () => {
    if (step !== "questions") {
      return;
    }

    setAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers];

      nextAnswers[questionIndex] = currentAnswer.trim();
      return nextAnswers;
    });
  };

  const goBack = () => {
    if (step === "gender") {
      setStep("start");
      return;
    }

    if (step === "name") {
      setStep("gender");
      return;
    }

    if (step === "images") {
      setStep("name");
      return;
    }

    if (step === "questions") {
      saveCurrentQuestionDraft();

      if (questionIndex > 0) {
        const previousQuestionIndex = questionIndex - 1;

        setQuestionIndex(previousQuestionIndex);
        setCurrentAnswer(answers[previousQuestionIndex] ?? "");
        return;
      }

      setStep("images");
      return;
    }

    if (step === "result") {
      setStep("questions");
      setQuestionIndex(questions.length - 1);
      setCurrentAnswer(answers[questions.length - 1] ?? "");
      return;
    }

    if (step === "transitionMap") {
      if (movementContext?.returnTo === "dashboard") {
        setStep("returningDashboard");
        return;
      }

      if (movementContext?.returnTo === "saved") {
        setStep("start");
        setIsMyMetagraphOpen(true);
        return;
      }

      setStep("result");
    }
  };

  const getSafeResultFileName = () => {
    const safeName = name
      .trim()
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^a-zа-я0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "");

    return safeName ? `metagraph-${safeName}.txt` : "metagraph-result.txt";
  };

  const getFullResultText = () => {
    const resultText = aiResult && !analysisFailed ? aiResult : fallbackResult;
    const selectedImageLines = selectedImageDetails
      .map((image) =>
        image ? `${image.order}. ${image.name} — ${image.role}` : null,
      )
      .filter(Boolean)
      .join("\n");
    const answerLines = questions
      .map((question, index) => `${question}: ${answers[index] ?? ""}`)
      .join("\n");

    return [
      "Метаграф-разбор",
      "",
      `Имя: ${formatName(name)}`,
      `Пол: ${selectedGender ? genderLabels[selectedGender] : "Не указан"}`,
      "",
      "Выбранные образы:",
      selectedImageLines || "Не выбраны",
      "",
      "Ответы:",
      answerLines,
      "",
      "Разбор:",
      resultText,
    ].join("\n");
  };

  async function downloadResultText() {
    const resultText = getFullResultText();
    const fileName = getSafeResultFileName();

    setResultDownloadHint("");

    try {
      const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      try {
        const file = new File([resultText], fileName, {
          type: "text/plain;charset=utf-8",
        });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: "Метаграф-разбор",
            text: "Ваш Метаграф-разбор",
            files: [file],
          });
          return;
        }

        if (navigator.share) {
          await navigator.share({
            title: "Метаграф-разбор",
            text: resultText,
          });
          return;
        }

        const textWindow = window.open("", "_blank", "noopener,noreferrer");

        if (textWindow) {
          textWindow.document.write(`<pre>${escapeSvgText(resultText)}</pre>`);
          textWindow.document.close();
          return;
        }

        setResultDownloadHint(
          "Если файл не скачался, зажмите текст и сохраните или скопируйте его.",
        );
      } catch {
        setResultDownloadHint(
          "Если файл не скачался, зажмите текст и сохраните или скопируйте его.",
        );
      }
    }
  }

  async function copyResultText() {
    setCopyMessage("");

    try {
      await navigator.clipboard.writeText(getFullResultText());
      setCopyMessage("Разбор скопирован");
    } catch {
      setCopyMessage("Не удалось скопировать автоматически. Выделите текст вручную.");
    }
  }

  async function downloadSavedResultText(result: SavedMetagraphResult) {
    const resultName = result.name ?? "Метаграф";
    const resultText = [
      "Метаграф-разбор",
      "",
      `Имя: ${resultName}`,
      result.gender ? `Пол: ${result.gender}` : null,
      result.created_at
        ? `Дата: ${new Date(result.created_at).toLocaleDateString("ru-RU")}`
        : null,
      "",
      "Разбор:",
      result.analysis_text ?? "",
    ]
      .filter((line) => line !== null)
      .join("\n");
    const safeName = resultName
      .trim()
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^a-zа-я0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "");

    setResultDownloadHint("");

    try {
      const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = safeName ? `metagraph-${safeName}.txt` : "metagraph-result.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setResultDownloadHint("Если файл не скачался, зажмите текст и сохраните его.");
    }
  }

  async function copySavedResultText(result: SavedMetagraphResult) {
    setCopyMessage("");

    try {
      await navigator.clipboard.writeText(result.analysis_text ?? "");
      setCopyMessage("Разбор скопирован");
    } catch {
      setCopyMessage("Не удалось скопировать автоматически. Выделите текст вручную.");
    }
  }

  async function copyMetagraphCardText(cardText: string) {
    setCopyMessage("");

    try {
      await navigator.clipboard.writeText(cardText);
      setCopyMessage("Карточка скопирована");
    } catch {
      setCopyMessage("Не удалось скопировать автоматически. Выделите текст вручную.");
    }
  }

  async function signInWithEmail(email: string) {
    if (!supabase) {
      setAuthMessage("Вход временно недоступен.");
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setAuthMessage("Введите email.");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");

    try {
      if (step === "result") {
        window.localStorage.setItem(
          "pendingMetagraphResult",
          JSON.stringify(buildMetagraphPayload(user?.id ?? "pending")),
        );
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setAuthEmail(trimmedEmail);
      setAuthCode("");
      setAuthStep("code");
      setAuthMessage("Мы отправили код на ваш email. Введите его ниже.");
    } catch (error) {
      console.error("Failed to send email code.", error);
      setAuthMessage("Не удалось отправить код. Попробуйте ещё раз.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function verifyEmailCode() {
    if (!supabase) {
      setAuthMessage("Вход временно недоступен.");
      return;
    }

    const trimmedEmail = authEmail.trim();
    const trimmedCode = authCode.trim();

    if (!trimmedEmail) {
      setAuthStep("email");
      setAuthMessage("Введите email.");
      return;
    }

    if (!trimmedCode) {
      setAuthMessage("Введите код из письма.");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedCode,
        type: "email",
      });

      if (error) {
        throw error;
      }

      const currentSession = data.session ?? null;
      const currentUser = data.user ?? currentSession?.user ?? null;

      setSession(currentSession);
      setUser(currentUser);
      setAuthCode("");
      setAuthMessage("Вы вошли. Метаграф сохранён.");

      if (currentUser) {
        await savePendingMetagraphResult(currentUser);
        await loadReturningDashboard(currentUser);
      }
    } catch (error) {
      console.error("Failed to verify email code.", error);
      setAuthMessage("Код не подошёл. Проверьте письмо и попробуйте ещё раз.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setSavedResults([]);
    setOpenedSavedResult(null);
    setSaveMessage("");
    setSavedResultId(null);
    setAuthStep("email");
    setAuthCode("");
    setIsAuthModalOpen(false);
  }

  function openProfileModal() {
    setAuthMessage("");

    if (!user) {
      setAuthStep("email");
      setAuthCode("");
    }

    setIsAuthModalOpen(true);
  }

  async function saveMetagraphResult() {
    setSaveMessage("");

    if (!user) {
      window.localStorage.setItem(
        "pendingMetagraphResult",
        JSON.stringify(buildMetagraphPayload("pending")),
      );
      setAuthMessage("Введите email, чтобы сохранить Метаграф.");
      setAuthStep("email");
      setAuthCode("");
      setIsAuthModalOpen(true);
      return null;
    }

    setSaveLoading(true);

    try {
      const createdId = await insertMetagraphPayload(buildMetagraphPayload(user.id));

      setSavedResultId(createdId ?? null);
      setSaveMessage("Метаграф сохранён");
      window.localStorage.setItem(
        "lastMetagraphResult",
        JSON.stringify({
          ...buildLocalMetagraphResult(),
          id: createdId ?? savedResultId ?? "local-latest",
        }),
      );
      return createdId ?? null;
    } catch (error) {
      console.error("Failed to save Metagraph result.", error);
      setSaveMessage("Не удалось сохранить. Попробуйте ещё раз.");
      return null;
    } finally {
      setSaveLoading(false);
    }
  }

  async function openMyMetagraph() {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setOpenedSavedResult(null);
    setIsMyMetagraphOpen(true);
    await loadSavedResults(user);
  }

  const getMovementDraft = (
    steps = movementSteps,
    completedSteps = completedMovementSteps,
    currentStep = currentMovementStep,
    notes = movementNotes,
    diary = movementDiary,
    context = movementContext,
  ) => ({
    current_step: currentStep,
    steps,
    completed_steps: completedSteps,
    notes,
    diary,
    context,
  });

  async function persistMovementProgress(
    draft = getMovementDraft(),
    context = movementContext,
  ) {
    if (!context) {
      return;
    }

    if (!user || !context.resultId || !supabase) {
      window.localStorage.setItem("movementProgressDraft", JSON.stringify(draft));
      return;
    }

    try {
      if (movementProgressId) {
        const { error } = await supabase
          .from("movement_progress")
          .update({
            current_step: draft.current_step,
            steps: draft.steps,
            completed_steps: draft.completed_steps,
            notes: draft.notes,
            diary: draft.diary,
          })
          .eq("id", movementProgressId);

        if (error) {
          throw error;
        }

        return;
      }

      const { data: existingProgress, error: selectError } = await supabase
        .from("movement_progress")
        .select("id")
        .eq("result_id", context.resultId)
        .maybeSingle();

      if (selectError) {
        throw selectError;
      }

      if (existingProgress?.id) {
        setMovementProgressId(existingProgress.id as string);
        await supabase
          .from("movement_progress")
          .update({
            current_step: draft.current_step,
            steps: draft.steps,
            completed_steps: draft.completed_steps,
            notes: draft.notes,
            diary: draft.diary,
          })
          .eq("id", existingProgress.id);
        return;
      }

      const { data, error } = await supabase
        .from("movement_progress")
        .insert({
          user_id: user.id,
          result_id: context.resultId,
          current_step: draft.current_step,
          steps: draft.steps,
          completed_steps: draft.completed_steps,
          notes: draft.notes,
          diary: draft.diary,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      setMovementProgressId((data?.id as string | undefined) ?? null);
    } catch (error) {
      console.error("Failed to persist movement progress.", error);
      window.localStorage.setItem("movementProgressDraft", JSON.stringify(draft));
    }
  }

  async function loadMovementProgress(context: MovementContext, baseSteps: MovementStep[]) {
    setMovementProgressId(null);

    if (user && context.resultId && supabase) {
      try {
        const { data, error } = await supabase
          .from("movement_progress")
          .select("id, current_step, steps, completed_steps, notes, diary")
          .eq("result_id", context.resultId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          const loadedSteps = (data.steps as MovementStep[]) ?? baseSteps;
          const loadedCompleted = (data.completed_steps as string[]) ?? [];
          const loadedCurrentStep =
            typeof data.current_step === "number" ? data.current_step : 0;

          setMovementProgressId(data.id as string);
          setMovementSteps(
            getDecoratedMovementSteps(loadedSteps, loadedCompleted, loadedCurrentStep),
          );
          setCompletedMovementSteps(loadedCompleted);
          setCurrentMovementStep(loadedCurrentStep);
          setMovementNotes((data.notes as MovementEntry[]) ?? []);
          setMovementDiary((data.diary as MovementEntry[]) ?? []);
          return;
        }
      } catch (error) {
        console.error("Failed to load movement progress.", error);
      }
    }

    const localDraft = window.localStorage.getItem("movementProgressDraft");

    if (localDraft && !user) {
      try {
        const parsedDraft = JSON.parse(localDraft) as ReturnType<typeof getMovementDraft>;

        if (parsedDraft.context?.analysisText === context.analysisText) {
          const parsedSteps = parsedDraft.steps?.length ? parsedDraft.steps : baseSteps;
          const parsedCompleted = parsedDraft.completed_steps ?? [];
          const parsedCurrentStep = parsedDraft.current_step ?? 0;

          setMovementSteps(
            getDecoratedMovementSteps(parsedSteps, parsedCompleted, parsedCurrentStep),
          );
          setCompletedMovementSteps(parsedCompleted);
          setCurrentMovementStep(parsedCurrentStep);
          setMovementNotes(parsedDraft.notes ?? []);
          setMovementDiary(parsedDraft.diary ?? []);
          return;
        }
      } catch {
        window.localStorage.removeItem("movementProgressDraft");
      }
    }

    setMovementSteps(getDecoratedMovementSteps(baseSteps, [], 0));
    setCompletedMovementSteps([]);
    setCurrentMovementStep(0);
    setMovementNotes([]);
    setMovementDiary([]);

    const initialDraft = {
      current_step: 0,
      steps: getDecoratedMovementSteps(baseSteps, [], 0),
      completed_steps: [],
      notes: [],
      diary: [],
      context,
    };

    if (user && context.resultId && supabase) {
      try {
        const { data, error } = await supabase
          .from("movement_progress")
          .insert({
            user_id: user.id,
            result_id: context.resultId,
            current_step: initialDraft.current_step,
            steps: initialDraft.steps,
            completed_steps: initialDraft.completed_steps,
            notes: initialDraft.notes,
            diary: initialDraft.diary,
          })
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        setMovementProgressId((data?.id as string | undefined) ?? null);
        return;
      } catch (error) {
        console.error("Failed to create movement progress.", error);
      }
    }

    window.localStorage.setItem("movementProgressDraft", JSON.stringify(initialDraft));
  }

  async function openTransitionMapFromCurrentResult() {
    setMovementMessage("");

    let resultId = savedResultId;

    if (user && !resultId) {
      resultId = await saveMetagraphResult();
    }

    const context: MovementContext = {
      resultId,
      name: formatName(name),
      analysisText,
      imageUrl: generatedImageUrl || null,
      role: metagraphResult.archetype.title ?? inferMovementRole(analysisText),
      source: analysisSource,
      returnTo: "result",
    };
    const baseSteps = generateMovementSteps(analysisText, answers);

    setMovementContext(context);
    await loadMovementProgress(context, baseSteps);
    setStep("transitionMap");
  }

  async function openTransitionMapFromSavedResult(result: SavedMetagraphResult) {
    const resultText = result.analysis_text ?? "";
    const context: MovementContext = {
      resultId: result.id,
      name: result.name ?? "Метаграф",
      analysisText: resultText,
      imageUrl: result.image_url ?? null,
      role: result.role ?? inferMovementRole(resultText),
      source: result.source ?? null,
      returnTo: "saved",
    };
    const baseSteps = generateMovementSteps(resultText);

    setOpenedSavedResult(result);
    setMovementContext(context);
    await loadMovementProgress(context, baseSteps);
    setIsMyMetagraphOpen(false);
    setStep("transitionMap");
  }

  async function openTransitionMapFromDashboard() {
    if (!returningResult) {
      return;
    }

    const resultText = returningResult.analysis_text ?? "";
    const context: MovementContext = {
      resultId: returningResult.id,
      name: returningResult.name ?? "Метаграф",
      analysisText: resultText,
      imageUrl: returningResult.image_url ?? null,
      role: returningResult.role ?? inferMovementRole(resultText),
      source: returningResult.source ?? null,
      returnTo: "dashboard",
    };
    const baseSteps = generateMovementSteps(resultText);

    setMovementContext(context);
    await loadMovementProgress(context, baseSteps);
    setStep("transitionMap");
  }

  function openReturningAnalysis() {
    if (!returningResult) {
      return;
    }

    setOpenedSavedResult(returningResult);
    setIsMyMetagraphOpen(true);
  }

  function startNewSlice() {
    setSelectedGender(null);
    setName("");
    setSelectedImages([]);
    setQuestionIndex(0);
    setCurrentAnswer("");
    setAnswers([]);
    setAiResult("");
    setAnalysisFailed(false);
    setGeneratedImageUrl("");
    setSavedResultId(null);
    setSaveMessage("");
    setStep("gender");
  }

  function updateMovementProgressState({
    steps = movementSteps,
    completedSteps = completedMovementSteps,
    currentStep = currentMovementStep,
    notes = movementNotes,
    diary = movementDiary,
    message,
  }: {
    steps?: MovementStep[];
    completedSteps?: string[];
    currentStep?: number;
    notes?: MovementEntry[];
    diary?: MovementEntry[];
    message?: string;
  }) {
    const decoratedSteps = getDecoratedMovementSteps(steps, completedSteps, currentStep);

    setMovementSteps(decoratedSteps);
    setCompletedMovementSteps(completedSteps);
    setCurrentMovementStep(currentStep);
    setMovementNotes(notes);
    setMovementDiary(diary);

    if (message) {
      setMovementMessage(message);
    }

    persistMovementProgress({
      current_step: currentStep,
      steps: decoratedSteps,
      completed_steps: completedSteps,
      notes,
      diary,
      context: movementContext,
    });
  }

  function completeMovementStep() {
    const activeStep = movementSteps[currentMovementStep];

    if (!activeStep) {
      return;
    }

    const nextCompletedSteps = Array.from(
      new Set([...completedMovementSteps, activeStep.id]),
    );
    const nextCurrentStep = Math.min(currentMovementStep + 1, movementSteps.length - 1);

    updateMovementProgressState({
      completedSteps: nextCompletedSteps,
      currentStep: nextCurrentStep,
      message:
        nextCompletedSteps.length === movementSteps.length
          ? "Все 7 шагов собраны."
          : "Шаг собран. Открыт следующий.",
    });
  }

  function postponeMovementStep() {
    const activeStep = movementSteps[currentMovementStep];

    if (!activeStep) {
      return;
    }

    const nextNotes = [
      {
        id: crypto.randomUUID(),
        type: "postponed",
        stepId: activeStep.id,
        createdAt: new Date().toISOString(),
      },
      ...movementNotes,
    ];

    updateMovementProgressState({
      notes: nextNotes,
      message: "Шаг перенесён. Карта сохранит его как текущий.",
    });
  }

  function replaceMovementTask() {
    const alternativeTasks = [
      "Запишите одну честную фразу: что я сейчас откладываю и почему?",
      "Сделайте одно действие на 10 минут без требования результата.",
      "Отправьте одно сообщение человеку, с которым давно хотели связаться.",
      "Сделайте одну заметку/сторис/публикацию в черновик.",
      "Назовите одну зону утечки энергии и один способ вернуть её в действие.",
      "Выберите один маленький предмет как артефакт перехода и носите его сегодня с собой.",
      "Закройте один незавершённый микрошаг, который висит в голове.",
    ];
    const nextTask =
      alternativeTasks[
        (movementNotes.length + movementDiary.length + currentMovementStep) %
          alternativeTasks.length
      ];
    const nextSteps = movementSteps.map((movementStep, index) =>
      index === currentMovementStep ? { ...movementStep, task: nextTask } : movementStep,
    );

    updateMovementProgressState({
      steps: nextSteps,
      message: "Задание обновлено.",
    });
  }

  function saveMovementDiaryNote() {
    const activeStep = movementSteps[currentMovementStep];

    if (!activeStep || !movementDiaryText.trim()) {
      return;
    }

    const nextDiary = [
      {
        id: crypto.randomUUID(),
        text: movementDiaryText.trim(),
        stepId: activeStep.id,
        createdAt: new Date().toISOString(),
      },
      ...movementDiary,
    ];

    setMovementDiaryText("");
    updateMovementProgressState({
      diary: nextDiary,
      message: "Заметка сохранена.",
    });
  }

  async function downloadImage(imageUrl: string) {
    setDownloadHint("");

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = "metagraph-image.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
      setDownloadHint("Зажмите изображение и выберите ‘Сохранить фото’.");
    }
  }

  if (step === "transitionMap") {
    const activeStep = movementSteps[currentMovementStep] ?? movementSteps[0];
    const completedCount = completedMovementSteps.length;
    const progressPercent = movementSteps.length
      ? Math.round((completedCount / movementSteps.length) * 100)
      : 0;
    const mapText = movementContext?.analysisText ?? analysisText;
    const assemblyRole =
      movementContext?.role || extractResultSection(mapText, "Ваш предварительный образ") ||
      inferMovementRole(mapText);
    const daimon =
      extractResultSection(mapText, "Даймон") ??
      "Сборка новой роли через маленькие действия";
    const shadow =
      extractResultSection(mapText, "Что может мешать") ??
      "Напряжение уходит в разрядку, вместо того чтобы превращаться в действие.";
    const artifact =
      extractResultSection(mapText, "Артефакт перехода") ?? "Жетон первого следа";
    const keyPhrase =
      extractResultSection(mapText, "Фраза-ключ") ??
      "Я могу двигаться мягко, но по-настоящему.";

    return (
      <>
        <main className="min-h-screen bg-[#F7F7F7] px-5 pb-12 pt-28 text-[#111111] sm:px-8">
          <BackButton onClick={goBack} />
          <ProfileButton
            email={profileEmail}
            onClick={() => {
              setStep("start");
              openProfileModal();
            }}
          />
          <SmallLogo />
          <section className="mx-auto w-full max-w-4xl">
            <p className="text-sm font-medium text-zinc-500">Карта движения</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">
              Карта перехода
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              Ваш Метаграф — это не только разбор, а маршрут движения. Здесь
              видно, где вы сейчас, какой следующий шаг открыт и что уже собрано.
            </p>

            {!user ? (
              <div className="mt-6 rounded-[24px] border border-[#85DCF6]/70 bg-white/70 p-5 text-sm leading-6 text-zinc-700">
                <p>
                  Карта пока сохранена только на этом устройстве. Войдите по
                  email, чтобы не потерять её и вернуться с другого телефона.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.localStorage.setItem(
                      "pendingMetagraphResult",
                      JSON.stringify(buildMetagraphPayload("pending")),
                    );
                    window.localStorage.setItem(
                      "movementProgressDraft",
                      JSON.stringify(getMovementDraft()),
                    );
                    setAuthStep("email");
                    setAuthCode("");
                    setStep("start");
                    setIsAuthModalOpen(true);
                  }}
                  className="mt-4 rounded-full border-2 border-[#85DCF6] bg-white px-5 py-2.5 font-medium text-[#111111]"
                >
                  Сохранить и войти
                </button>
              </div>
            ) : null}

            <div className="mt-8 rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Точка сборки</h2>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-700 sm:grid-cols-2">
                <p>
                  <strong className="text-[#111111]">Образ силы:</strong>{" "}
                  {assemblyRole.split("\n")[0]}
                </p>
                <p>
                  <strong className="text-[#111111]">Даймон:</strong>{" "}
                  {daimon.split("\n")[0]}
                </p>
                <p>
                  <strong className="text-[#111111]">Тень силы:</strong>{" "}
                  {shadow.split("\n")[0]}
                </p>
                <p>
                  <strong className="text-[#111111]">Артефакт:</strong>{" "}
                  {artifact.split("\n")[0]}
                </p>
                <p className="sm:col-span-2">
                  <strong className="text-[#111111]">Фраза-ключ:</strong>{" "}
                  {keyPhrase.split("\n")[0]}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 text-sm text-zinc-500">
                <span>
                  {completedCount} из {movementSteps.length || 7} шагов пройдено
                </span>
                <span>{progressPercent}% пути собрано</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-[#85DCF6] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {activeStep ? (
              <div className="mt-6 rounded-[28px] border-2 border-[#85DCF6] bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-zinc-500">
                  Текущий шаг {currentMovementStep + 1}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{activeStep.title}</h2>
                <p className="mt-4 text-base leading-7 text-zinc-700">
                  {activeStep.description}
                </p>
                <div className="mt-5 rounded-3xl bg-[#F7F7F7] p-5">
                  <p className="text-sm font-semibold">Задание текущего шага</p>
                  <p className="mt-2 text-base leading-7 text-zinc-700">
                    {activeStep.task}
                  </p>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={completeMovementStep}
                    className="rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 font-semibold"
                  >
                    Выполнил
                  </button>
                  <button
                    type="button"
                    onClick={postponeMovementStep}
                    className="rounded-full border border-zinc-200 bg-white px-6 py-3 font-medium"
                  >
                    Перенести
                  </button>
                  <button
                    type="button"
                    onClick={replaceMovementTask}
                    className="rounded-full px-6 py-3 font-medium underline underline-offset-4"
                  >
                    Хочу другое задание
                  </button>
                </div>
                {movementMessage ? (
                  <p className="mt-4 text-sm text-zinc-500">{movementMessage}</p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8 space-y-3">
              <h2 className="text-2xl font-semibold">7 шагов перехода</h2>
              {movementSteps.map((movementStep, index) => (
                <div
                  key={movementStep.id}
                  className={`rounded-[24px] border bg-white/70 p-5 transition ${
                    movementStep.status === "active"
                      ? "border-[#85DCF6]"
                      : "border-black/5"
                  } ${movementStep.status === "locked" ? "opacity-55" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Шаг {index + 1}</p>
                      <h3 className="mt-1 text-lg font-semibold">
                        {movementStep.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-[#F7F7F7] px-3 py-1 text-xs font-medium">
                      {movementStep.status === "completed"
                        ? "✓ Собрано"
                        : movementStep.status === "active"
                          ? "Открыто"
                          : "Закрыто"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {movementStep.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm">
              <h2 className="text-2xl font-semibold">Дневник перехода</h2>
              <p className="mt-3 text-base leading-7 text-zinc-600">
                Запишите, что изменилось после шага. Не нужно писать красиво —
                важно заметить движение.
              </p>
              <textarea
                value={movementDiaryText}
                onChange={(event) => setMovementDiaryText(event.target.value)}
                rows={5}
                placeholder="Что я заметил? Где стало легче? Где появилось сопротивление?"
                className="mt-5 w-full resize-none rounded-3xl border border-zinc-200 bg-white px-5 py-4 text-base leading-7 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
              <button
                type="button"
                onClick={saveMovementDiaryNote}
                disabled={!movementDiaryText.trim()}
                className="mt-4 rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Сохранить заметку
              </button>
              {movementDiary.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {movementDiary.slice(0, 3).map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-3xl bg-[#F7F7F7] p-4 text-sm leading-6 text-zinc-700"
                    >
                      <p>{entry.text}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 font-semibold"
              >
                Вернуться к разбору
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("gender");
                }}
                className="rounded-full border border-zinc-200 bg-white px-6 py-3 font-medium"
              >
                Пройти Метаграф заново
              </button>
            </div>
          </section>
        </main>
      </>
    );
  }

  const authModal = isAuthModalOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[28px] bg-[#F7F7F7] p-6 text-[#111111] shadow-[0_24px_80px_rgba(17,17,17,0.18)]">
        <button
          type="button"
          aria-label="Закрыть вход"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl leading-none"
        >
          ×
        </button>
        <h2 className="pr-10 text-2xl font-semibold tracking-tight">
          Сохраните свой Метаграф
        </h2>
        {user ? (
          <div className="mt-5 space-y-4">
            <p className="text-base leading-7 text-[#111111]/75">
              Вы вошли как {user.email ?? session?.user.email}
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  openMyMetagraph();
                }}
                className="rounded-full border-2 border-[#85DCF6] bg-white px-5 py-3 text-base font-medium"
              >
                Мой Метаграф
              </button>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-base font-medium"
              >
                Выйти
              </button>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="rounded-full px-5 py-3 text-base font-medium underline underline-offset-4"
              >
                Закрыть
              </button>
            </div>
          </div>
        ) : (
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (authStep === "email") {
                signInWithEmail(authEmail);
                return;
              }

              verifyEmailCode();
            }}
          >
            {authStep === "email" ? (
              <>
                <p className="text-base leading-7 text-[#111111]/75">
                  Введите email, чтобы сохранить разбор, карту перехода и
                  прогресс с любого устройства.
                </p>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="Email"
                  className="w-full rounded-full border border-zinc-200 bg-white px-5 py-4 text-base outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-full border-2 border-[#85DCF6] bg-white px-5 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authLoading ? "Отправляем..." : "Получить код"}
                </button>
              </>
            ) : (
              <>
                <p className="text-base leading-7 text-[#111111]/75">
                  Введите код из письма для {authEmail}.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={authCode}
                  onChange={(event) => setAuthCode(event.target.value)}
                  placeholder="Код из письма"
                  className="w-full rounded-full border border-zinc-200 bg-white px-5 py-4 text-center text-base tracking-[0.24em] outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-full border-2 border-[#85DCF6] bg-white px-5 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authLoading ? "Проверяем..." : "Войти"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep("email");
                    setAuthCode("");
                    setAuthMessage("");
                  }}
                  className="w-full rounded-full px-5 py-3 text-sm font-medium underline underline-offset-4"
                >
                  Изменить email
                </button>
              </>
            )}
          </form>
        )}
        {authMessage ? (
          <p className="mt-4 text-sm leading-6 text-zinc-500">{authMessage}</p>
        ) : null}
      </div>
    </div>
  ) : null;

  const myMetagraphModal = isMyMetagraphOpen ? (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F7F7F7] px-5 py-8 text-[#111111] sm:px-8">
      <button
        type="button"
        aria-label="Закрыть Мой Метаграф"
        onClick={() => {
          setIsMyMetagraphOpen(false);
          setOpenedSavedResult(null);
        }}
        className="fixed right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-3xl leading-none shadow-lg"
      >
        ×
      </button>
      <section className="mx-auto w-full max-w-3xl py-14">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Мой Метаграф
        </h2>
        {openedSavedResult ? (
          <div className="mt-8">
            {openedSavedResult.image_url ? (
              <img
                src={openedSavedResult.image_url}
                alt="Сохранённый образ Метаграфа"
                className="mx-auto mb-8 aspect-[3/4] w-full max-w-[360px] rounded-[28px] object-cover shadow-[0_24px_70px_rgba(24,24,27,0.18)]"
              />
            ) : null}
            <article className="rounded-[28px] border border-zinc-200 bg-white/70 p-6 text-left shadow-sm">
              <div className="whitespace-pre-wrap text-base leading-8 text-zinc-800">
                {openedSavedResult.analysis_text}
              </div>
            </article>
            <button
              type="button"
              onClick={() => setOpenedSavedResult(null)}
              className="mt-6 rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 text-base font-medium"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <div className="mt-8">
            {savedResultsLoading ? (
              <p className="text-zinc-500">Загружаем сохранённые Метаграфы…</p>
            ) : savedResults.length > 0 ? (
              <div className="space-y-4">
                {savedResults.map((result) => (
                  <div
                    key={result.id}
                    className="rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm"
                  >
                    <p className="text-sm text-zinc-500">
                      {result.created_at
                        ? new Date(result.created_at).toLocaleDateString("ru-RU")
                        : "Без даты"}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {result.name || "Метаграф"}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {[result.role, result.source].filter(Boolean).join(" · ") ||
                        "Сохранённый разбор"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpenedSavedResult(result)}
                      className="mt-4 rounded-full border-2 border-[#85DCF6] bg-white px-5 py-2.5 text-sm font-medium"
                    >
                      Открыть разбор
                    </button>
                    <button
                      type="button"
                      onClick={() => openTransitionMapFromSavedResult(result)}
                      className="ml-2 mt-4 rounded-full border border-[#85DCF6] bg-white px-5 py-2.5 text-sm font-medium"
                    >
                      Открыть карту
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500">
                У вас пока нет сохранённых Метаграфов.
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setIsMyMetagraphOpen(false);
                setStep("gender");
              }}
              className="mt-8 rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 text-base font-medium"
            >
              Пройти Метаграф
            </button>
          </div>
        )}
      </section>
    </div>
  ) : null;

  if (step === "postTypingApp") {
    const appResult = returningResult ?? buildLocalMetagraphResult();
    const appText = appResult.analysis_text ?? analysisText;
    const appName = appResult.name ?? formatName(name);
    const appDate = appResult.created_at
      ? new Date(appResult.created_at).toLocaleDateString("ru-RU")
      : new Date().toLocaleDateString("ru-RU");
    const appRole = appResult.role ?? inferMovementRole(appText) ?? "Человек перехода";
    const appDaimon =
      appResult.daimon ??
      extractResultSection(appText, "Даймон") ??
      "Сборка новой роли через маленькие действия";
    const appArtifact =
      appResult.artifact ??
      extractResultSection(appText, "Артефакт перехода") ??
      "Артефакт перехода";
    const appKeyPhrase =
      appResult.key_phrase ??
      extractResultSection(appText, "Фраза-ключ") ??
      "Я могу двигаться мягко, но по-настоящему.";
    const appImageUrl = appResult.image_url ?? generatedImageUrl;
    const appSteps = movementSteps.length ? movementSteps : generateMovementSteps(appText);
    const appCompletedCount = completedMovementSteps.length;
    const appProgressPercent = appSteps.length
      ? Math.round((appCompletedCount / appSteps.length) * 100)
      : 0;
    const metagraphArchive =
      savedResults.length > 0 ? savedResults : appResult.analysis_text ? [appResult] : [];
    const appActiveStep =
      appSteps[currentMovementStep] ?? appSteps[0] ?? {
        id: "first-trace",
        title: "Оставить первый след",
        description: "Сделать маленькое действие, чтобы внутренний вектор стал движением.",
        task: "Выберите один первый след на 15 минут и выполните его без требования результата.",
        status: "active" as const,
      };
    const metagraphCardText = `${appName}
Образ силы: ${appRole}
Даймон: ${appDaimon.split("\n")[0]}
Артефакт: ${appArtifact.split("\n")[0]}
Фраза-ключ: ${appKeyPhrase.split("\n")[0]}
Прогресс: ${appCompletedCount} из ${appSteps.length || 7}`;
    const openEmailSave = () => {
      window.localStorage.setItem(
        "pendingMetagraphResult",
        JSON.stringify(buildMetagraphPayloadFromSavedResult(appResult, "pending")),
      );
      window.localStorage.setItem("lastMetagraphResult", JSON.stringify(appResult));
      window.localStorage.setItem(
        "movementProgressDraft",
        JSON.stringify(getMovementDraft()),
      );
      setAuthStep("email");
      setAuthCode("");
      setAuthMessage("Введите email, чтобы сохранить Метаграф.");
      setIsAuthModalOpen(true);
    };
    const openSavedMetagraphInApp = async (result: SavedMetagraphResult) => {
      const resultText = result.analysis_text ?? "";
      const resultId =
        result.id.startsWith("local") || result.id === "pending" ? null : result.id;
      const context: MovementContext = {
        resultId,
        name: result.name ?? "Метаграф",
        analysisText: resultText,
        imageUrl: result.image_url ?? null,
        role: result.role ?? inferMovementRole(resultText),
        source: result.source ?? null,
        returnTo: "dashboard",
      };

      setReturningResult(result);
      setReturningProgress(null);
      await loadMovementProgress(context, generateMovementSteps(resultText));
      setPostTypingTab("metagraph");
    };

    return (
      <>
        <main className="min-h-screen bg-[#F7F7F7] px-4 pb-28 pt-7 text-[#111111] sm:px-6">
          <div className="mx-auto w-full max-w-[520px]">
            <header className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Личное пространство
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  Мой Метаграф
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setPostTypingTab("profile")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/85 text-sm font-semibold shadow-sm"
                aria-label="Профиль"
              >
                {profileEmail?.charAt(0).toUpperCase() ?? "•"}
              </button>
            </header>

            {postTypingTab === "home" ? (
              <section className="mt-8 space-y-5">
                <div className="overflow-hidden rounded-[32px] bg-zinc-950 px-6 py-8 text-center text-white shadow-[0_24px_80px_rgba(17,17,17,0.22)]">
                  <DaimonOrb />
                  <p className="mt-7 text-sm font-medium uppercase tracking-[0.2em] text-white/55">
                    Твой Даймон
                  </p>
                  <p className="mt-3 text-xl font-semibold leading-7">
                    {appDaimon.split("\n")[0]}
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-sm">
                    <p className="text-sm font-medium text-zinc-500">Моя сборка</p>
                    <h2 className="mt-2 text-2xl font-semibold">{appRole}</h2>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {appDaimon.split("\n")[0]}
                    </p>
                    <p className="mt-3 rounded-3xl bg-[#F7F7F7] px-4 py-3 text-sm font-medium leading-6">
                      {appKeyPhrase.split("\n")[0]}
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-sm">
                    <p className="text-sm font-medium text-zinc-500">Мой путь</p>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-200">
                      <div
                        className="h-full rounded-full bg-[#85DCF6] transition-all duration-500"
                        style={{ width: `${appProgressPercent}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-zinc-600">
                      {appCompletedCount} из {appSteps.length || 7} шагов собрано
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{appActiveStep.title}</h3>
                    <button
                      type="button"
                      onClick={() => setPostTypingTab("path")}
                      className="mt-4 rounded-full border-2 border-[#85DCF6] bg-white px-5 py-2.5 text-sm font-semibold"
                    >
                      Открыть карту
                    </button>
                  </div>

                  <div className="rounded-[28px] border border-[#85DCF6]/70 bg-white/80 p-5 shadow-sm">
                    <p className="text-sm font-medium text-zinc-500">Мои Метаграфы</p>
                    <p className="mt-2 text-base font-semibold">
                      Последний Метаграф: {appDate}
                    </p>
                    <button
                      type="button"
                      onClick={startNewSlice}
                      className="mt-4 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Пройти ещё раз
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-black/5 bg-white/75 p-5 shadow-sm">
                  <h2 className="text-xl font-semibold">Точка сборки</h2>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
                    <p>
                      <strong className="text-[#111111]">Образ силы:</strong>{" "}
                      {appRole}
                    </p>
                    <p>
                      <strong className="text-[#111111]">Артефакт:</strong>{" "}
                      {appArtifact.split("\n")[0]}
                    </p>
                    <p>
                      <strong className="text-[#111111]">Фраза-ключ:</strong>{" "}
                      {appKeyPhrase.split("\n")[0]}
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-black/5 bg-white/75 p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4 text-sm text-zinc-500">
                    <span>
                      {appCompletedCount} из {appSteps.length || 7} шагов собрано
                    </span>
                    <span>{appProgressPercent}% пути</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-200">
                    <div
                      className="h-full rounded-full bg-[#85DCF6] transition-all duration-500"
                      style={{ width: `${appProgressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#85DCF6]/70 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-zinc-500">Ближайший шаг</p>
                  <h2 className="mt-2 text-2xl font-semibold">{appActiveStep.title}</h2>
                  <p className="mt-3 text-base leading-7 text-zinc-700">
                    {appActiveStep.task}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPostTypingTab("tasks")}
                    className="mt-5 rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 font-semibold"
                  >
                    Перейти к заданию
                  </button>
                </div>
              </section>
            ) : null}

            {postTypingTab === "metagraph" ? (
              <section className="mt-8 space-y-5">
                {appImageUrl ? (
                  <img
                    src={appImageUrl}
                    alt="Образ Метаграфа"
                    className="mx-auto aspect-[3/4] w-full max-w-[420px] rounded-[32px] object-cover shadow-[0_24px_80px_rgba(17,17,17,0.18)]"
                  />
                ) : (
                  <div className="rounded-[32px] bg-zinc-950 px-6 py-10 text-center text-white shadow-[0_24px_80px_rgba(17,17,17,0.18)]">
                    <DaimonOrb />
                    <p className="mt-6 text-lg font-semibold">Образ проявляется</p>
                  </div>
                )}
                <div className="rounded-[28px] border border-black/5 bg-white/75 p-5 shadow-sm">
                  <p className="text-sm text-zinc-500">{appDate}</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight">{appName}</h2>
                  <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-zinc-800">
                    {appText}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => downloadSavedResultText(appResult)}
                    className="rounded-full border-2 border-[#85DCF6] bg-white px-5 py-3 font-semibold"
                  >
                    Скачать разбор
                  </button>
                  <button
                    type="button"
                    onClick={() => copySavedResultText(appResult)}
                    className="rounded-full border border-[#85DCF6] bg-white px-5 py-3 font-medium"
                  >
                    Скопировать
                  </button>
                  <button
                    type="button"
                    onClick={startNewSlice}
                    className="rounded-full border border-zinc-200 bg-white px-5 py-3 font-medium"
                  >
                    Пройти ещё раз
                  </button>
                </div>
                {copyMessage || resultDownloadHint ? (
                  <p className="text-center text-sm text-zinc-500">
                    {copyMessage || resultDownloadHint}
                  </p>
                ) : null}
              </section>
            ) : null}

            {postTypingTab === "path" ? (
              <section className="mt-8 space-y-5">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight">
                    Карта перехода
                  </h2>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-200">
                    <div
                      className="h-full rounded-full bg-[#85DCF6] transition-all duration-500"
                      style={{ width: `${appProgressPercent}%` }}
                    />
                  </div>
                </div>
                {appSteps.map((movementStep, index) => (
                  <div
                    key={movementStep.id}
                    className={`rounded-[26px] border bg-white/75 p-5 shadow-sm transition ${
                      movementStep.status === "active"
                        ? "border-[#85DCF6]"
                        : "border-black/5"
                    } ${movementStep.status === "locked" ? "opacity-55" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-zinc-500">Шаг {index + 1}</p>
                        <h3 className="mt-1 text-xl font-semibold">
                          {movementStep.title}
                        </h3>
                      </div>
                      <span className="rounded-full bg-[#F7F7F7] px-3 py-1 text-xs font-medium">
                        {movementStep.status === "completed"
                          ? "Собрано"
                          : movementStep.status === "active"
                            ? "Открыто"
                            : "Закрыто"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {movementStep.description}
                    </p>
                    {movementStep.status === "active" ? (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={completeMovementStep}
                          className="rounded-full border-2 border-[#85DCF6] bg-white px-5 py-2.5 font-semibold"
                        >
                          Выполнил
                        </button>
                        <button
                          type="button"
                          onClick={postponeMovementStep}
                          className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 font-medium"
                        >
                          Перенести
                        </button>
                        <button
                          type="button"
                          onClick={replaceMovementTask}
                          className="rounded-full px-5 py-2.5 font-medium underline underline-offset-4"
                        >
                          Хочу другое задание
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </section>
            ) : null}

            {postTypingTab === "tasks" ? (
              <section className="mt-8 space-y-5">
                <div className="rounded-[32px] bg-zinc-950 p-6 text-white shadow-[0_24px_80px_rgba(17,17,17,0.22)]">
                  <p className="text-sm font-medium text-white/55">Задание</p>
                  <h2 className="mt-2 text-3xl font-semibold">{appActiveStep.title}</h2>
                  <p className="mt-4 text-base leading-7 text-white/78">
                    {appActiveStep.task}
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={completeMovementStep}
                      className="rounded-full bg-[#DFFF45] px-5 py-3 font-semibold text-zinc-950"
                    >
                      Выполнил
                    </button>
                    <button
                      type="button"
                      onClick={postponeMovementStep}
                      className="rounded-full border border-white/20 px-5 py-3 font-medium"
                    >
                      Перенести
                    </button>
                    <button
                      type="button"
                      onClick={replaceMovementTask}
                      className="rounded-full px-5 py-3 font-medium underline underline-offset-4"
                    >
                      Хочу другое задание
                    </button>
                  </div>
                </div>
                <div className="rounded-[28px] border border-black/5 bg-white/75 p-5 shadow-sm">
                  <h2 className="text-2xl font-semibold">Дневник перехода</h2>
                  <p className="mt-3 text-base leading-7 text-zinc-600">
                    Запишите, что изменилось после шага. Не нужно писать красиво —
                    важно заметить движение.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-zinc-500">
                    <span className="rounded-full bg-[#F7F7F7] px-3 py-2">
                      Где стало легче?
                    </span>
                    <span className="rounded-full bg-[#F7F7F7] px-3 py-2">
                      Где появилось сопротивление?
                    </span>
                    <span className="rounded-full bg-[#F7F7F7] px-3 py-2">
                      Какой маленький шаг я сделал?
                    </span>
                  </div>
                  <textarea
                    value={movementDiaryText}
                    onChange={(event) => setMovementDiaryText(event.target.value)}
                    rows={5}
                    placeholder="Что я сегодня заметил?"
                    className="mt-5 w-full resize-none rounded-3xl border border-zinc-200 bg-white px-5 py-4 text-base leading-7 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                  />
                  <button
                    type="button"
                    onClick={saveMovementDiaryNote}
                    disabled={!movementDiaryText.trim()}
                    className="mt-4 rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Сохранить заметку
                  </button>
                  {movementDiary.length > 0 ? (
                    <div className="mt-6 space-y-3">
                      {movementDiary.slice(0, 3).map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-3xl bg-[#F7F7F7] p-4 text-sm leading-6 text-zinc-700"
                        >
                          <p>{entry.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {postTypingTab === "profile" ? (
              <section className="mt-8 space-y-5">
                <div className="overflow-hidden rounded-[32px] bg-zinc-950 p-6 text-white shadow-[0_24px_80px_rgba(17,17,17,0.22)]">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/45">
                    Паспорт
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Мой профиль Метаграфа
                  </h2>
                  <div className="mt-6 space-y-3 text-sm leading-6 text-white/78">
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="text-white/45">Имя</span>
                      <span className="text-right font-medium text-white">{appName}</span>
                    </div>
                    {profileEmail ? (
                      <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                        <span className="text-white/45">Email</span>
                        <span className="text-right font-medium text-white">
                          {profileEmail}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="text-white/45">Дата последнего Метаграфа</span>
                      <span className="text-right font-medium text-white">{appDate}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="text-white/45">Образ силы</span>
                      <span className="text-right font-medium text-white">{appRole}</span>
                    </div>
                    <div className="border-b border-white/10 pb-3">
                      <span className="text-white/45">Даймон</span>
                      <p className="mt-1 font-medium text-white">
                        {appDaimon.split("\n")[0]}
                      </p>
                    </div>
                    <div className="border-b border-white/10 pb-3">
                      <span className="text-white/45">Артефакт</span>
                      <p className="mt-1 font-medium text-white">
                        {appArtifact.split("\n")[0]}
                      </p>
                    </div>
                    <div className="border-b border-white/10 pb-3">
                      <span className="text-white/45">Фраза-ключ</span>
                      <p className="mt-1 font-medium text-white">
                        {appKeyPhrase.split("\n")[0]}
                      </p>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="text-white/45">Текущий шаг</span>
                      <span className="text-right font-medium text-white">
                        {appActiveStep.title}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-white/45">Прогресс</span>
                      <span className="text-right font-medium text-white">
                        {appCompletedCount} из {appSteps.length || 7}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[32px] border border-[#85DCF6]/70 bg-white/85 p-6 shadow-sm">
                  <p className="text-sm font-medium text-zinc-500">Мой образ</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    {appName}
                  </h2>
                  <div className="mt-5 space-y-3 text-sm leading-6 text-zinc-700">
                    <p>
                      <strong className="text-[#111111]">Образ силы:</strong>{" "}
                      {appRole}
                    </p>
                    <p>
                      <strong className="text-[#111111]">Даймон:</strong>{" "}
                      {appDaimon.split("\n")[0]}
                    </p>
                    <p>
                      <strong className="text-[#111111]">Артефакт:</strong>{" "}
                      {appArtifact.split("\n")[0]}
                    </p>
                    <p>
                      <strong className="text-[#111111]">Фраза-ключ:</strong>{" "}
                      {appKeyPhrase.split("\n")[0]}
                    </p>
                    <p>
                      <strong className="text-[#111111]">Прогресс:</strong>{" "}
                      {appCompletedCount} из {appSteps.length || 7}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyMetagraphCardText(metagraphCardText)}
                    className="mt-5 w-full rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 font-semibold"
                  >
                    Скопировать карточку
                  </button>
                  {copyMessage ? (
                    <p className="mt-3 text-center text-sm text-zinc-500">
                      {copyMessage}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-[32px] border border-black/5 bg-white/80 p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Мои Метаграфы
                  </h2>
                  {savedResultsLoading ? (
                    <p className="mt-4 text-sm text-zinc-500">
                      Загружаем сохранённые Метаграфы…
                    </p>
                  ) : metagraphArchive.length > 0 ? (
                    <div className="mt-5 space-y-3">
                      {metagraphArchive.slice(0, 5).map((result) => (
                        <div
                          key={result.id}
                          className="rounded-3xl bg-[#F7F7F7] p-4 text-sm leading-6"
                        >
                          <p className="text-zinc-500">
                            {result.created_at
                              ? new Date(result.created_at).toLocaleDateString("ru-RU")
                              : "На этом устройстве"}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold">
                            {result.name || "Метаграф"}
                          </h3>
                          <p className="mt-1 text-zinc-600">
                            {result.role || inferMovementRole(result.analysis_text ?? "")}
                          </p>
                          <button
                            type="button"
                            onClick={() => openSavedMetagraphInApp(result)}
                            className="mt-3 rounded-full border border-[#85DCF6] bg-white px-4 py-2 text-sm font-medium"
                          >
                            Открыть
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-zinc-500">
                      Здесь появятся ваши сохранённые Метаграфы.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={startNewSlice}
                    className="mt-5 w-full rounded-full bg-zinc-950 px-6 py-3 font-semibold text-white"
                  >
                    Пройти ещё раз
                  </button>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Можно пройти Метаграф заново, когда почувствуете, что
                    состояние изменилось.
                  </p>
                </div>

                <div className="rounded-[32px] border border-black/5 bg-white/75 p-6 shadow-sm">
                  {user ? (
                    <div className="space-y-4">
                      <p className="rounded-3xl bg-[#85DCF6]/20 px-5 py-4 font-medium">
                        Метаграф сохранён
                      </p>
                      <button
                        type="button"
                        onClick={signOut}
                        className="w-full rounded-full border border-zinc-200 bg-white px-6 py-3 font-medium"
                      >
                        Выйти
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-base leading-7 text-zinc-700">
                        Сейчас Метаграф сохранён только на этом устройстве.
                        Войдите по email, чтобы не потерять его и открыть с
                        другого телефона.
                      </p>
                      <button
                        type="button"
                        onClick={openEmailSave}
                        className="w-full rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 font-semibold"
                      >
                        Сохранить через email
                      </button>
                    </div>
                  )}
                </div>
              </section>
            ) : null}
          </div>
        </main>
        <BottomNavigation activeTab={postTypingTab} onChange={setPostTypingTab} />
        {authModal}
        {myMetagraphModal}
      </>
    );
  }

  if (step === "returningDashboard") {
    const dashboardText = returningResult?.analysis_text ?? "";
    const dashboardSteps =
      returningProgress?.steps?.length
        ? returningProgress.steps
        : generateMovementSteps(dashboardText);
    const dashboardCompleted = returningProgress?.completed_steps ?? [];
    const dashboardCurrentStep =
      typeof returningProgress?.current_step === "number"
        ? returningProgress.current_step
        : Math.min(dashboardCompleted.length, dashboardSteps.length - 1);
    const dashboardActiveStep =
      dashboardSteps[dashboardCurrentStep] ?? dashboardSteps[0];
    const dashboardPercent = dashboardSteps.length
      ? Math.round((dashboardCompleted.length / dashboardSteps.length) * 100)
      : 0;
    const dashboardRole =
      returningResult?.role ?? inferMovementRole(dashboardText);
    const dashboardDaimon =
      returningResult?.daimon ??
      extractResultSection(dashboardText, "Даймон") ??
      "Сборка новой роли через маленькие действия";
    const dashboardKeyPhrase =
      returningResult?.key_phrase ??
      extractResultSection(dashboardText, "Фраза-ключ") ??
      "Я могу двигаться мягко, но по-настоящему.";

    return (
      <>
        <main className="min-h-screen bg-[#F7F7F7] px-5 pb-12 pt-10 text-[#111111] sm:px-8">
          <ProfileButton email={profileEmail} onClick={openProfileModal} />
          <section className="mx-auto w-full max-w-4xl">
            <p className="text-sm font-medium text-zinc-500">Возвращение</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">
              Мой Метаграф
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              Вы уже начали свой переход. Здесь можно вернуться к разбору,
              открыть карту и продолжить движение.
            </p>

            {!user ? (
              <div className="mt-6 rounded-[24px] border border-[#85DCF6]/70 bg-white/70 p-5 text-sm leading-6 text-zinc-700">
                <p>
                  Сейчас Метаграф сохранён только на этом устройстве. Войдите по
                  email, чтобы не потерять его и открыть с другого телефона.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep("email");
                    setAuthCode("");
                    setStep("start");
                    setIsAuthModalOpen(true);
                  }}
                  className="mt-4 rounded-full border-2 border-[#85DCF6] bg-white px-5 py-2.5 font-medium text-[#111111]"
                >
                  Сохранить через email
                </button>
              </div>
            ) : null}

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm lg:col-span-2">
                <h2 className="text-xl font-semibold">Точка сборки</h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
                  <p>
                    <strong className="text-[#111111]">Образ силы:</strong>{" "}
                    {dashboardRole}
                  </p>
                  <p>
                    <strong className="text-[#111111]">Даймон:</strong>{" "}
                    {dashboardDaimon.split("\n")[0]}
                  </p>
                  <p>
                    <strong className="text-[#111111]">Фраза-ключ:</strong>{" "}
                    {dashboardKeyPhrase.split("\n")[0]}
                  </p>
                  <p className="text-zinc-500">
                    {returningResult?.created_at
                      ? `Дата последнего Метаграфа: ${new Date(
                          returningResult.created_at,
                        ).toLocaleDateString("ru-RU")}`
                      : "Дата последнего Метаграфа: на этом устройстве"}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Прогресс</h2>
                <p className="mt-4 text-sm text-zinc-500">
                  {dashboardCompleted.length} из {dashboardSteps.length || 7} шагов собрано
                </p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-[#85DCF6] transition-all duration-500"
                    style={{ width: `${dashboardPercent}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-600">
                  {dashboardPercent}% пути собрано
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">Текущий шаг</p>
              <h2 className="mt-2 text-2xl font-semibold">
                {dashboardActiveStep?.title ?? "Оставить первый след"}
              </h2>
              <p className="mt-3 text-base leading-7 text-zinc-700">
                {dashboardActiveStep?.task ??
                  "Сделайте одно маленькое действие, чтобы внутренний вектор стал движением."}
              </p>
              <button
                type="button"
                onClick={openTransitionMapFromDashboard}
                className="mt-5 rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 font-semibold"
              >
                Открыть карту перехода
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={openTransitionMapFromDashboard}
                className="rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 font-semibold"
              >
                Открыть карту перехода
              </button>
              <button
                type="button"
                onClick={openReturningAnalysis}
                className="rounded-full border border-[#85DCF6] bg-white px-6 py-3 font-medium"
              >
                Открыть мой разбор
              </button>
              <button
                type="button"
                onClick={startNewSlice}
                className="rounded-full border border-zinc-200 bg-white px-6 py-3 font-medium"
              >
                Пройти ещё раз
              </button>
              {user ? (
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-full px-6 py-3 font-medium underline underline-offset-4"
                >
                  Выйти
                </button>
              ) : null}
            </div>
          </section>
        </main>
        {authModal}
        {myMetagraphModal}
      </>
    );
  }

  if (step === "result") {
    const isImagePending = !generatedImageUrl && (Boolean(aiResult) || analysisFailed);

    return (
      <>
      <main className="flex min-h-screen flex-1 justify-center bg-[#F7F7F7] px-6 pb-10 pt-28 text-zinc-950">
        <BackButton onClick={goBack} />
        <ProfileButton email={profileEmail} onClick={openProfileModal} />
        <section className="mx-auto flex w-full max-w-3xl flex-col">
          <SmallLogo />
          {isAnalyzing ? (
            <p className="mt-16 text-center text-2xl font-medium tracking-tight text-zinc-800">
              Метаграф собирает ваш образ…
            </p>
          ) : isImagePending ? (
            <p className="mt-16 text-center text-2xl font-medium tracking-tight text-zinc-800">
              Метаграф проявляет ваш образ…
            </p>
          ) : (
            <>
              {generatedImageUrl ? (
                <div className="mx-auto flex w-full max-w-[420px] flex-col items-center">
                  <div className="relative w-full">
                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(true)}
                      className="block w-full overflow-hidden rounded-[28px] shadow-[0_24px_70px_rgba(24,24,27,0.18)]"
                      aria-label="Открыть образ на весь экран"
                    >
                      <img
                        src={generatedImageUrl}
                        alt="Сгенерированный образ Метаграфа"
                        className="aspect-[3/4] w-full rounded-[28px] object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadImage(generatedImageUrl)}
                      className="absolute bottom-4 right-4 rounded-full bg-zinc-950/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur transition-colors hover:bg-zinc-800"
                    >
                      Скачать
                    </button>
                  </div>
                  {downloadHint ? (
                    <p className="mt-3 text-center text-sm leading-6 text-zinc-500">
                      {downloadHint}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-10">
                {aiResult && !analysisFailed ? (
                  <article className="rounded-[28px] border border-zinc-200 bg-white/70 p-6 text-left shadow-sm">
                    <div className="whitespace-pre-wrap text-base leading-8 text-zinc-800">
                      {aiResult}
                    </div>
                  </article>
                ) : (
                  <article className="rounded-[28px] border border-zinc-200 bg-white/70 p-6 text-left shadow-sm">
                    <div className="whitespace-pre-wrap text-base leading-8 text-zinc-800">
                      {fallbackResult}
                    </div>
                  </article>
                )}
              </div>

              <div className="mt-8 rounded-[28px] border border-[#85DCF6]/70 bg-white/75 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Сохранить мой Метаграф
                </h2>
                <p className="mt-3 text-base leading-7 text-zinc-600">
                  Сохраните разбор, карту перехода и прогресс, чтобы вернуться
                  к ним с любого устройства.
                </p>
                <button
                  type="button"
                  onClick={saveMetagraphResult}
                  disabled={saveLoading}
                  className="mt-5 w-full rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 text-base font-semibold text-[#111111] shadow-sm transition hover:border-[#6FD1EE] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saveLoading
                    ? "Сохраняем..."
                    : user
                      ? "Сохранить мой Метаграф"
                      : "Сохранить через email"}
                </button>
                {saveMessage ? (
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {saveMessage}
                  </p>
                ) : null}
              </div>

              <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                <button
                  type="button"
                  onClick={downloadResultText}
                  className="rounded-full border-2 border-[#85DCF6] bg-white px-6 py-3 text-base font-medium text-[#111111] shadow-sm transition hover:border-[#6FD1EE]"
                >
                  Скачать разбор
                </button>
                <button
                  type="button"
                  onClick={copyResultText}
                  className="rounded-full border border-[#85DCF6] bg-white px-6 py-3 text-base font-medium text-[#111111] shadow-sm transition hover:border-[#6FD1EE]"
                >
                  Скопировать
                </button>
              </div>
              {resultDownloadHint || copyMessage ? (
                <p className="mt-3 text-center text-sm leading-6 text-zinc-500">
                  {copyMessage || resultDownloadHint}
                </p>
              ) : null}
              {savedResultId ? (
                <p className="sr-only">Сохранённый Метаграф: {savedResultId}</p>
              ) : null}
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={openTransitionMapFromCurrentResult}
                  className="rounded-full border-2 border-[#85DCF6] bg-white px-7 py-3 text-base font-semibold text-[#111111] shadow-sm transition hover:border-[#6FD1EE]"
                >
                  Открыть карту перехода
                </button>
              </div>

              {isImageModalOpen && generatedImageUrl ? (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 px-5 py-8">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(false)}
                    className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-3xl leading-none text-zinc-950 shadow-lg"
                    aria-label="Закрыть"
                  >
                    ×
                  </button>
                  <img
                    src={generatedImageUrl}
                    alt="Сгенерированный образ Метаграфа"
                    className="max-h-[78vh] w-full max-w-[420px] rounded-[28px] object-contain shadow-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => downloadImage(generatedImageUrl)}
                    className="mt-6 rounded-full bg-white px-6 py-3 text-base font-medium text-zinc-950 shadow-lg"
                  >
                    Скачать образ
                  </button>
                  {downloadHint ? (
                    <p className="mt-3 max-w-sm text-center text-sm leading-6 text-white/80">
                      {downloadHint}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
          <button
            type="button"
            className="mx-auto mt-8 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7]"
          >
            Завершить
          </button>
        </section>
      </main>
      {authModal}
      {myMetagraphModal}
      </>
    );
  }

  if (step === "questions") {
    return (
      <>
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 pb-10 pt-28 text-zinc-950">
        <BackButton onClick={goBack} />
        <ProfileButton email={profileEmail} onClick={openProfileModal} />
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
      {authModal}
      {myMetagraphModal}
      </>
    );
  }

  if (step === "images") {
    return (
      <>
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] pb-10 pt-28 text-zinc-950">
        <BackButton onClick={goBack} />
        <ProfileButton email={profileEmail} onClick={openProfileModal} />
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
              onClick={() => {
                setQuestionIndex(0);
                setCurrentAnswer(answers[0] ?? "");
                setStep("questions");
              }}
              className="mt-10 rounded-full bg-zinc-950 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 focus:ring-offset-[#F7F7F7]"
            >
              Далее
            </button>
          ) : null}
        </section>
      </main>
      {authModal}
      {myMetagraphModal}
      </>
    );
  }

  if (step === "name") {
    return (
      <>
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 pb-10 pt-28 text-zinc-950">
        <BackButton onClick={goBack} />
        <ProfileButton email={profileEmail} onClick={openProfileModal} />
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
      {authModal}
      {myMetagraphModal}
      </>
    );
  }

  if (step === "gender") {
    return (
      <>
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 pb-10 pt-28 text-zinc-950">
        <BackButton onClick={goBack} />
        <ProfileButton email={profileEmail} onClick={openProfileModal} />
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
      {authModal}
      {myMetagraphModal}
      </>
    );
  }

  if (step === "start" && !returningChecked) {
    return (
      <>
        <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F7F7F7] px-6 text-center text-zinc-950">
          <ProfileButton email={profileEmail} onClick={openProfileModal} />
          <p className="text-base font-medium text-zinc-500">
            Метаграф проверяет ваш путь…
          </p>
        </main>
        {authModal}
        {myMetagraphModal}
      </>
    );
  }

  return (
    <>
      <main className="flex min-h-screen flex-1 justify-center bg-[#F7F7F7] px-6 text-zinc-950">
        <ProfileButton email={profileEmail} onClick={openProfileModal} />
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center pt-6 text-center">
          <Image
            src="/metagraph-logo.png"
            alt="Логотип Метаграф"
            width={2237}
            height={2358}
            priority
            sizes="43vh"
            className="start-reveal h-[38vh] w-auto sm:h-[42vh]"
          />
          <h1
            className="start-reveal mt-5 max-w-[980px] text-center text-[clamp(2rem,8.4vw,4.5rem)] font-semibold uppercase leading-[0.98] tracking-[-0.03em] text-[#111111] [animation-delay:120ms] sm:mt-7 sm:leading-[0.96] lg:max-w-[620px] lg:text-[36px] lg:leading-[1.02] lg:tracking-[-0.015em] xl:text-[38px]"
            style={{ fontFamily: '"Lagonic", "Laqonic", "Manrope", sans-serif' }}
          >
            <span className="block">Глубокая персональная</span>
            <span className="block">распаковка человека</span>
            <span className="block">
              и его следующего уровня
              <span className="text-[#85DCF6]">.</span>
            </span>
          </h1>
          <button
            type="button"
            onClick={() => setStep("gender")}
            className="start-reveal mt-12 w-full max-w-[500px] rounded-full border-2 border-[#85DCF6] bg-white px-10 py-5 text-center text-[21px] font-semibold text-[#111111] shadow-[0_12px_36px_rgba(17,17,17,0.06)] transition duration-200 [animation-delay:240ms] hover:border-[#6FD1EE] hover:shadow-[0_16px_42px_rgba(17,17,17,0.08)] active:scale-[0.99] sm:mt-14 sm:py-7 sm:text-[26px] lg:mt-7"
          >
            Начать
          </button>
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            className="start-reveal mt-5 text-sm font-medium text-[#111111]/80 underline underline-offset-4 transition [animation-delay:360ms] hover:text-[#111111] sm:text-base lg:mt-3"
          >
            Что такое Метаграф
          </button>
        </section>
      </main>

      {isAboutOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F7F7F7] px-5 py-6 text-[#111111] sm:px-8 sm:py-10">
          <button
            type="button"
            aria-label="Закрыть описание Метаграфа"
            onClick={() => setIsAboutOpen(false)}
            className="fixed right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-3xl font-light leading-none text-[#111111] shadow-[0_10px_30px_rgba(17,17,17,0.08)] transition hover:scale-105 sm:right-8 sm:top-8"
          >
            ×
          </button>
          <section className="mx-auto flex min-h-full w-full max-w-[760px] flex-col justify-center py-14">
            <h2
              className="text-4xl font-semibold tracking-tight sm:text-6xl"
              style={{ fontFamily: '"Lagonic", "Manrope", sans-serif' }}
            >
              Что такое Метаграф
            </h2>
            <MetagraphAboutContent />
            <button
              type="button"
              onClick={() => {
                setIsAboutOpen(false);
                setStep("gender");
              }}
              className="mt-10 w-full max-w-[460px] rounded-full border-2 border-[#85DCF6] bg-white px-9 py-4 text-center text-xl font-semibold text-[#111111] shadow-[0_12px_36px_rgba(17,17,17,0.06)] transition duration-200 hover:border-[#6FD1EE] hover:shadow-[0_16px_42px_rgba(17,17,17,0.08)] active:scale-[0.99] sm:py-5 sm:text-2xl"
            >
              Пройти Метаграф
            </button>
          </section>
        </div>
      ) : null}
      {authModal}
      {myMetagraphModal}
    </>
  );
}
