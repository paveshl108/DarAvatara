"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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
  const moneyMeaning = themes.money
    ? "Вы называете деньги, и в этом контексте они выглядят не только как финансы. Скорее, это маркер свободы, права играть в свою игру, проявляться видимо и получать обмен за собственную энергию."
    : "Даже если внешний запрос пока не назван одним словом, за ним чувствуется желание более честного обмена с жизнью: меньше распыления, больше ясности, формы и собственного места.";
  const regulationMeaning =
    themes.tension || themes.smoking || themes.tiredness || themes.body
      ? `В ответах слышны темы ${[
          themes.tension ? "напряжения" : null,
          themes.smoking ? "курения" : null,
          themes.tiredness ? "усталости" : null,
          themes.body ? "тела" : null,
        ]
          .filter(Boolean)
          .join(", ")}. Я читаю это не как слабость, а как сигнал: накопленная энергия ищет быстрый способ разрядки, а телу и нервному ритму нужна более бережная опора.`
      : "В ответах нет необходимости искать проблему: важнее заметить, где внутреннее напряжение просит формы, а не очередного усилия через силу.";
  const transitionMeaning =
    themes.manifestation || themes.movement || themes.smoking
      ? `Вы прямо указываете на ${[
          themes.manifestation ? "проявленность" : null,
          themes.movement ? "движение вперёд" : null,
          themes.smoking ? "желание изменить привычку курения" : null,
        ]
          .filter(Boolean)
          .join(", ")}. Это делает точку перехода очень конкретной: не просто «измениться», а начать переводить накопленную энергию в действие, видимость и новый способ обходиться с напряжением.`
      : "Точка перехода связана с тем, что вы уже чувствуете важность шага, но часть вас ещё ждёт более безопасного момента.";
  const confidenceMeaning = themes.confidence
    ? "Фраза про то, что «всё получится», звучит как скрытая сила: её сложно признать полностью, потому что тогда придётся разрешить себе больше действия и меньше отступления."
    : "Скрытая сила здесь не кричит. Она проявляется в том, что вы уже способны назвать важные темы и выдержать честный взгляд на них.";

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
    ? "проявлять себя видимо, но без насилия над собственной чувствительностью"
    : uniqueTags.includes("наблюдение") || uniqueTags.includes("интеллект")
      ? "переводить наблюдение и внутреннюю ясность в живое действие"
      : uniqueTags.includes("тепло") || uniqueTags.includes("сердце")
        ? "строить путь через контакт, тепло и бережную близость"
        : uniqueTags.includes("пауза") || uniqueTags.includes("мечта")
          ? "дать мечте форму, ритм и первый земной шаг"
          : "собрать разрозненные ощущения в понятный личный вектор";
  const limitation = themes.tension && themes.smoking
    ? "мешать может не слабость, а накопленное напряжение, которое ищет быстрый способ разрядки через привычное действие"
    : themes.fear
      ? "часть вас уже видит направление, но защищает вас от резкого шага через осторожность и сомнение"
      : themes.tiredness
        ? "внутри может быть не отсутствие желания, а усталость от лишних расходов и попыток держать слишком многое одновременно"
        : answerText.match(/не знаю|непонят|потер/)
        ? "защитой сейчас может быть ожидание полной ясности, хотя первый шаг может появиться раньше, чем окончательный ответ"
        : "ограничение похоже не на слабость, а на привычку сначала всё понять и только потом разрешить себе движение";
  const artifact = themes.manifestation
    ? "дневник проявленности: маленькая карточка или заметка с вопросом «что я сегодня готов показать миру хотя бы на 1%?»"
    : themes.money
      ? "жетон первого обмена: небольшой предмет, который напоминает, что деньги здесь связаны с правом проявляться и вступать в честный обмен"
      : uniqueTags.includes("тишина")
    ? "маленький дневник тишины: одна страница, куда вы записываете не планы, а то, что действительно отзывается"
    : uniqueTags.includes("игра") || uniqueTags.includes("юмор")
      ? "карточка с фразой «я могу пробовать легче» — как разрешение не превращать каждый шаг в экзамен"
      : uniqueTags.includes("тело")
        ? "жест ладонью к груди или к животу: короткое напоминание вернуться в тело перед важным решением"
        : "личный знак перехода: простая фраза или предмет, который напоминает, что движение уже началось";
  const task = themes.smoking && themes.manifestation
    ? "в ближайшие 24–72 часа вместо одной привычной сигареты сделайте паузу на 3 минуты и запишите: «что я сейчас хочу проявить, но сдерживаю?» Затем сделайте один маленький видимый шаг: сообщение, заметку, звонок, публикацию или разговор"
    : themes.fear
      ? "в течение ближайших 24–72 часов сделайте один маленький шаг в сторону того, что страшно: напишите сообщение, откройте документ, назовите желание вслух или обозначьте границу"
      : themes.tiredness
        ? "в ближайшие 24–72 часа уберите один источник утечки энергии и освободите для себя хотя бы полчаса без компенсации и чувства долга"
        : "в ближайшие 24–72 часа выберите одно действие, которое можно сделать за 15 минут, и выполните его не ради результата, а ради возвращения движения";
  const answerLayer = answerSummary
    ? `В ваших ответах звучит живая реальность: ${answerSummary}. Я не читаю это как набор отдельных фраз. В них виден общий узор: ${userWords}.`
    : `В ответах пока важнее не конкретная формулировка, а сам факт движения: вы уже дошли до места, где хочется увидеть себя точнее.`;
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
    ? "Я имею право быть видимым и получать честный обмен за то, что во мне живое."
    : themes.smoking && (themes.tension || themes.body)
      ? "Я могу не гасить напряжение привычкой, а услышать, что именно просит выхода."
      : themes.fear && themes.movement
        ? "Я могу идти вперёд вместе со страхом, не отдавая ему право выбирать вместо меня."
        : themes.tiredness
          ? "Я возвращаю энергию туда, где моя жизнь перестаёт быть только удержанием."
          : "Я могу двигаться мягко, но по-настоящему.";

  return `${userName}, ваш Метаграф собран

Главный зов
Первая выбранная картинка — ${firstChoice?.name ?? "образ"} — показывает то, что сейчас сильнее всего притягивает ваше внимание. ${firstImageLine}. Это не обязательно прямая цель. Скорее, это направление, рядом с которым внутренний шум становится различимее: видно, куда вас тянет и какой слой жизни просит формы.

${answerLayer} Главный зов поэтому связан не только с картинкой, но и с тем, что вы сами назвали. ${moneyMeaning} В вашем выборе считывается движение ${genderTone}: не отвлечённая мечта, а попытка найти точку, где внутренняя энергия сможет стать действием, обменом, видимостью или спокойной уверенностью.

Этот образ говорит не о том, кем вы обязаны стать, а о том, что сейчас хочет проявиться. Если в ответах есть деньги, движение, проект, проявленность или желание, чтобы “всё получилось”, главный зов показывает: вам нужен не абстрактный успех, а место, где вы перестаёте прятать собственный импульс и начинаете обращаться с ним как с реальной силой.

Внутренняя потребность
Вторая выбранная картинка — ${secondChoice?.name ?? "образ"} — раскрывает слой потребности. ${secondImageLine}. Здесь речь не о внешнем результате, а о том, какая часть вас просит внимания: та, которой нужно тепло, ясность, признание, движение или право на паузу.

${regulationMeaning} Если рядом с этим есть тема проявленности, денег, отношений или публичности, внутренняя потребность звучит так: вам важно не только выйти наружу, но и не потерять себя в этом выходе. Не доказать что-то миру любой ценой, а найти способ быть видимым без внутреннего сжатия.

Эта потребность может быть тихой, но она важна, потому что без неё главный зов превращается в напряжение. Если внутри уже есть усталость, привычка быстро сбрасывать напряжение или ощущение, что тело тащит больше, чем хочется признавать, Метаграф показывает: ваша опора сейчас начинается не с контроля, а с более честного контакта с собой.

Точка перехода
Третья выбранная картинка — ${thirdChoice?.name ?? "образ"} — обозначает точку перехода. ${thirdImageLine}. Это место, где может быть сопротивление, тень или страх сделать следующий шаг. Но именно здесь чаще всего скрыта дверь.

${transitionMeaning} Точка перехода не требует резкого рывка. Она показывает, где старая стратегия уже стала тесной: ждать полной ясности, собирать ещё подтверждения, откладывать публичность, привычно разряжать напряжение или держать своё движение в тени.

Здесь важно увидеть сопротивление не как проблему, а как границу роста. То, что тормозит, часто не мешает вам, а защищает от слишком резкого изменения. С ним можно договориться: не ломать старый способ, а дать ему новую роль — охранять темп, но больше не отменять движение.

Ваш предварительный образ
Предварительный образ сейчас ближе к архетипу «${archetype}». Он складывается из повторяющихся оттенков: ${uniqueTags.slice(0, 10).join(", ")} — и из ваших собственных слов: ${userWords}. В этом образе есть ваша текущая сила: не абстрактный потенциал, а конкретный способ собирать себя в моменте.

${confidenceMeaning} Этот архетип показывает, что сейчас вы не стоите на месте. Вы находитесь в процессе внутренней сборки: что-то уже стало прежним, а новое ещё требует языка, формы и первого действия. Ваша сила — в способности замечать нюансы и не предавать внутреннюю правду ради быстрых ответов.

Даймон
Ваш Даймон сейчас направлен на то, чтобы ${daemonVector}. Это не мистика и не внешнее предназначение. Это глубинный вектор: куда вас тянет тогда, когда вы перестаёте подстраиваться под шум и начинаете слышать собственное движение.

Если в ответах звучат деньги, это не сводится к сумме. Деньги здесь могут быть внешним маркером того, что пора входить в обмен: проявлять форму, голос, результат, право занимать место. Если звучит проявленность, Даймон ведёт не к демонстративности, а к ясному присутствию. Если звучит напряжение или усталость, вектор начинается с возвращения энергии себе.

Похоже, вам важно не просто решить отдельный вопрос, а перейти в более точную роль. Такую, где ваши чувства, ум, тело и опыт не спорят друг с другом, а начинают работать как одна система.

Что может мешать
Мешать может то, что ${limitation}. Это не недостаток. Это защитный механизм, который когда-то помогал не ошибиться, не раскрыться слишком рано или не потерять контроль.

Сейчас этот механизм можно не ломать, а смягчать. Не требовать от себя мгновенной смелости, а создавать условия, в которых движение становится безопаснее. Если напряжение просит быстрой разрядки, важно не стыдить себя, а спросить: какую энергию я сейчас не выпускаю в действие? Если страх удерживает от проявления, важно не спорить со страхом, а дать ему маленький, точный и выполнимый шаг.

Артефакт перехода
Ваш артефакт перехода: ${artifact}. Он нужен не как украшение, а как якорь. Когда внимание распадается или появляется сомнение, этот символ может возвращать вас к главному вектору.

Пусть это будет простой знак, который не требует объяснений другим. Его задача — напоминать вам: выбранное направление уже существует, даже если оно пока оформляется медленно.

Задание для перехода
Ваше действие на ближайшие 24–72 часа: ${task}. Сделайте его достаточно маленьким, чтобы не пришлось преодолевать себя целиком.

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
  const [aiResult, setAiResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [downloadHint, setDownloadHint] = useState("");
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

  if (step === "result") {
    const isImagePending = !generatedImageUrl && (Boolean(aiResult) || analysisFailed);

    return (
      <main className="flex min-h-screen flex-1 justify-center bg-[#F7F7F7] px-6 pb-10 pt-28 text-zinc-950">
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
