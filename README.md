# Fix: music button + mobile lightbox

Что изменено:
1. Музыка больше не стартует автоматически.
2. Музыка включается только по кнопке.
3. Кнопка музыки теперь компактная: только `♪`.
4. Lightbox на мобильных стал аккуратнее:
   - изображение не вылезает за экран;
   - подпись не съедает полстраницы;
   - крестик остаётся доступным;
   - Telegram in-app browser должен вести себя стабильнее.

Как поставить:
1. Замени `index.html`.
2. Замени `script.js`.
3. Загрузи `style-mobile-lightbox-fix.css`.
4. Проверь, что в `index.html` есть строки:

<link rel="stylesheet" href="style-mobile-lightbox-fix.css?v=1" />
<script src="script.js?v=6"></script>
