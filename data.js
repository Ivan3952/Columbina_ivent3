// Данные сайта Moon Maiden.
// Оценка: одна оценка по 10-балльной шкале, без комментариев.

const EVENT = {
  title: "Moon Maiden",
  subtitle: "Итоги арт-ивента",
  cover: "img/cover.png",
  stats: "победители • участники • оценки по 10-балльной шкале"
};

const WORKS = [
  {
    id: 1,
    username: "@example_winner",
    title: "Пример работы победителя",
    image: "img/works/placeholder.svg",
    postLink: "",
    score: 10,
    reward: 5000,
    isWinner: true,
    place: 1
  },
  {
    id: 2,
    username: "@example_user",
    title: "Пример работы участника",
    image: "img/works/placeholder.svg",
    postLink: "",
    score: 8,
    reward: 1000,
    isWinner: false,
    place: null
  }
];
