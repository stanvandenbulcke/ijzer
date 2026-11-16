# SCIENCE — wetenschappelijk kader

> Bron: Bijlage A van `docs/SPEC.md`. DOI's/links worden toegevoegd na verificatie (Fase 4). In-app artikels worden hiervan afgeleid.

> Doel: de app geeft adviezen die gebaseerd zijn op de beste beschikbare evidentie, maar is eerlijk over onzekerheid. Schrijf de in-app artikels in eenvoudig Nederlands (±150–300 woorden elk), met een "In het kort"-zin, een "Wat doet de app hiermee"-alinea, en de bronnen onderaan. Onderscheid altijd **evidentie** (meta-analyses, gecontroleerde studies) van **vuistregels** (praktijk/heuristiek).

### A1. Trainingsvolume (aantal sets) — de sterkste knop voor spiergroei

- Volume is in overzichtsonderzoek de trainingsvariabele met de duidelijkste dosis-respons-relatie met spiergroei (umbrella review: Bernárdez-Vázquez et al. 2022).
- De grootste meta-regressie tot nu toe (Pelland, Remmert, Robinson, Hinson & Zourdos, _Sports Medicine_ 2026; 67 studies, 2.058 deelnemers) vond een positief verband tussen wekelijkse sets en zowel spiergroei als kracht, met **afnemende meeropbrengst**. Voor spiergroei liep de curve geleidelijk af (meer sets blijven iets toevoegen); voor kracht vlakte ze veel sneller af.
- **Fractional sets:** sets waarbij een spier secundair meewerkt (bv. triceps bij bankdrukken) tellen voor de helft. Deze telmethode gaf in die analyse de best passende modellen. → De app telt volume zo (§5.3).
- **Per sessie:** een preprint van dezelfde groep (Remmert et al. 2025) suggereert dat er voor spiergroei per sessie weinig aantoonbare meerwaarde is boven ±11 fractional sets per spier → spreiden over meerdere dagen is slimmer dan alles in één keer.
- **Vuistregel in de app:** 10–20 fractional sets per spier per week als standaard-doelzone, aanpasbaar; meer kan, maar herstel en tijd worden de beperking.

### A2. Frequentie

- Bij gelijk weekvolume lijkt hoe vaak je een spier traint weinig uit te maken voor spiergroei; voor kracht helpt een hogere frequentie wel, met afnemende meeropbrengst (Pelland et al. 2026).
- **App:** frequentie is vooral een hulpmiddel om volume per sessie behapbaar te houden (zie R2/R9).

### A3. Hoe dicht bij falen (RIR = reps in reserve)

- Meta-regressie (Robinson et al., _Sports Medicine_ 2024; 55 hypertrofie- en 67 krachtstudies): dichter bij falen trainen hangt samen met meer spiergroei, maar niet met meer krachtwinst. De onderzoekers stellen 0–5 RIR voor spiergroei voor en ±3–5 RIR voor kracht.
- Trainen tot volledig falen is niet nodig: een gecontroleerde studie bij getrainde personen vond vergelijkbare groei bij falen en bij 1–2 RIR, met meer vermoeidheid bij falen (Refalo et al. 2024).
- **App:** standaard doel-RIR 1–3 voor werksets; tip als de gelogde RIR structureel hoog is (R3).

### A4. Gewicht en rep-bereik

- Bij sets tot (of dicht bij) falen geven lichte en zware gewichten vergelijkbare spiergroei; zware gewichten geven meer maximale kracht (Schoenfeld et al., _JSCR_ 2017, meta-analyse van 21 studies).
- **App:** elk rep-bereik van ±5 tot 30 is geldig voor groei; ±6–15 is meestal het meest tijdsefficiënt (vuistregel). Voor kracht: ook zware sets met weinig reps.

### A5. Rusttijd tussen sets

- Bayesiaanse meta-analyse (Singer et al., _Frontiers in Sports and Active Living_ 2024): een klein voordeel voor rustpauzes langer dan 60 seconden, mogelijk omdat je dan meer volume (gewicht × reps) haalt. Het aantal studies is klein en vooral bij ongetrainde mannen, dus de onzekerheid is groot.
- **App:** standaard 2–3 min voor zware compounds, 1,5–2 min voor isolatie; tip als rust structureel < 60 s is (R4).

### A6. Bewegingsuitslag en training op lange spierlengte

- Volledige bewegingsuitslag is gemiddeld minstens zo goed als gedeeltelijke; partials in de **gerekte** positie ("lengthened partials") lijken beter dan partials in de verkorte positie (Wolf et al. 2023, meta-analyse). Het onderzoek is nog volop in ontwikkeling en niet alle studies zijn het eens.
- Concrete, sterkere voorbeelden waarbij dezelfde spier op langere lengte getraind werd:
  - **Triceps:** overhead extensions gaven duidelijk meer tricepsgroei dan pushdowns in neutrale armpositie, zelfs met lichtere gewichten (Maeo et al. 2023; hele triceps ±+20% vs. ±+14%).
  - **Hamstrings:** zittende leg curl > liggende leg curl (Maeo et al. 2021).
  - **Kuiten:** staande calf raise gaf veel meer gastrocnemius-groei dan zittende (Kinoshita et al. 2023).
- **App:** vlag `lengthened_emphasis` op oefeningen; tip als een spier er geen enkele krijgt (R5). Leg uit dat volledige ROM met nadruk op de stretch een veilige standaard is.

### A7. Progressieve overbelasting en stagnatie

- Spieren groeien zolang de prikkel voldoende blijft; in de praktijk volg je dat via meer reps of meer gewicht bij gelijke inspanning (dubbele progressie) en via e1RM-trends.
- Stagnatie heeft vaak oorzaken buiten de training (slaap, calorietekort, stress). **In een cut is kracht behouden al een succes.**
- Deloads (lichtere week) zijn een praktijkinstrument bij opgestapelde vermoeidheid (vuistregel).

### A8. Eiwit

- Meta-analyse (Morton et al., _Br J Sports Med_ 2018; 49 studies): extra eiwit boven ±1,6 g/kg/dag gaf geen meetbaar extra effect op vetvrije massa bij krachttraining; de bovengrens van het betrouwbaarheidsinterval lag rond 2,2 g/kg.
- Tijdens een calorietekort: Helms et al. (2014) adviseerden 2,3–3,1 g per kg **vetvrije massa** voor slanke, getrainde sporters. Een recentere meta-regressie (Refalo, Trexler & Helms, _Strength and Conditioning Journal_ 2025) vond dat meer eiwit samenhing met minder verlies van vetvrije massa, met een sterker verband als je eiwit uitdrukt per kg vetvrije massa; voordeel tot ±1,9 g/kg lichaamsgewicht of ±2,5 g/kg vetvrije massa.
- **App:** standaard 2,0 g/kg; voor mensen met meer lichaamsvet de optie om op doelgewicht of vetvrije massa te rekenen (anders worden de getallen onrealistisch hoog).

### A9. Afvaltempo

- Voor getrainde mensen wordt ±0,5–1% lichaamsgewicht per week aangeraden om spiermassa zo goed mogelijk te behouden (Helms et al. 2014). Bij elite-atleten gaf trager afvallen (0,7%/week) betere resultaten voor vetvrije massa dan sneller (1,4%/week) (Garthe et al. 2011).
- **App:** standaard 0,5–0,75%/week, max 1%/week, nooit onder de geschatte BMR.

### A10. Energieverbruik en de weegschaal

- Dagelijks gewicht schommelt sterk door vocht, zout, koolhydraten en darminhoud. Een **trendlijn** (exponentieel gemiddelde) toont de echte richting.
- Door inname te vergelijken met de verandering van de trend kun je je werkelijke verbruik schatten (principe zoals in MacroFactor; ±7.700 kcal per kg lichaamsgewicht is een benadering). Hoe consequenter je logt, hoe betrouwbaarder.
- **App:** §5.5, met betrouwbaarheidsindicator en uitleg.

### A11. Stappen

- Meta-analyse van 15 cohorten (Paluch et al., _Lancet Public Health_ 2022): meer stappen per dag hing samen met een steeds lager sterfterisico tot ±8.000–10.000 stappen bij volwassenen jonger dan 60 (6.000–8.000 bij 60+). 10.000 is dus geen magische grens.
- In een cut helpen stappen ook om het verbruik op peil te houden (vuistregel).
- **App:** standaard stappendoel 8.000, aanpasbaar.

### A12. Wat de app niet weet

- Hersteltoestand, slaap en stress worden niet gemeten; de "frisheid"-kaart is een schatting.
- Wetenschap evolueert; de artikels hebben een datum en worden bijgewerkt.

### Bronnen (zet DOI's/links in SCIENCE.md na verificatie)

- Pelland JC, Remmert JF, Robinson ZP, Hinson SR, Zourdos MC. The resistance training dose response: meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gains. _Sports Medicine_ 2026;56(2):481–505.
- Remmert JF, Pelland JC, Robinson ZP, Hinson SR, Zourdos MC. Is there too much of a good thing? Meta-regressions of the effect of per-session volume on hypertrophy and strength. _SportRχiv_ 2025 (preprint).
- Robinson ZP, Pelland JC, Remmert JF, Refalo MC, Jukic I, Steele J, Zourdos MC. Exploring the dose–response relationship between estimated resistance training proximity to failure, strength gain, and muscle hypertrophy. _Sports Medicine_ 2024.
- Refalo MC et al. Similar muscle hypertrophy following eight weeks of resistance training to momentary muscular failure or with repetitions-in-reserve in resistance-trained individuals. _J Sports Sci_ 2024.
- Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW. Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis. _JSCR_ 2017;31(12):3508–3523.
- Singer A, Wolf M, Generoso L, et al., Schoenfeld BJ. Give it a rest: a systematic review with Bayesian meta-analysis on the effect of inter-set rest interval duration on muscle hypertrophy. _Front Sports Act Living_ 2024;6:1429789.
- Bernárdez-Vázquez R, et al. Resistance training variables for optimization of muscle hypertrophy: an umbrella review. _Front Sports Act Living_ 2022.
- Wolf M, Androulakis-Korakakis P, Fisher J, Schoenfeld B, et al. Partial vs full range of motion resistance training: a systematic review and meta-analysis. _Int J Strength Cond_ 2023.
- Maeo S, et al. Greater hamstrings muscle hypertrophy but similar damage protection after training at long versus short muscle lengths. _Med Sci Sports Exerc_ 2021.
- Maeo S, et al. Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position. _Eur J Sport Sci_ 2023.
- Kinoshita M, Maeo S, et al. Triceps surae muscle hypertrophy is greater after standing versus seated calf-raise training. _Front Physiol_ 2023;14:1272106.
- Morton RW, et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults. _Br J Sports Med_ 2018;52(6):376–384.
- Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation. _J Int Soc Sports Nutr_ 2014.
- Refalo MC, Trexler ET, Helms ER. Effect of dietary protein on fat-free mass in energy restricted, resistance-trained individuals: an updated systematic review with meta-regression. _Strength Cond J_ 2025.
- Garthe I, Raastad T, Refsnes PE, et al. Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes. _IJSNEM_ 2011;21(2):97–104.
- Paluch AE, et al. Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. _Lancet Public Health_ 2022;7(3):e219–e228.
