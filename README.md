# Restore full style + mobile fixes

Почему всё сломалось:
index.html ссылался на CSS, которого не было в репозитории или который не загрузился.
Браузер открыл голый HTML без оформления.

Что в этом архиве:
- index.html
- script.js
- style-columbina-plus.css

Что исправлено:
1. Полный CSS лежит в архиве — оформление не зависит от старых файлов.
2. Credits убран.
3. На вкладке победителей есть пагинация.
4. Музыка включается только по кнопке.
5. Кнопка музыки — только нота ♪.
6. Мобильный lightbox поправлен.

Как поставить:
1. Загрузи/замени все 3 файла:
   - index.html
   - script.js
   - style-columbina-plus.css

2. В index.html должно быть:
<link rel="stylesheet" href="style-columbina-plus.css?v=7" />
<script src="script.js?v=7"></script>

3. Commit changes.
4. Открой сайт с:
?fresh=restore7
