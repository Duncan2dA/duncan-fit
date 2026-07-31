window.DUNCAN_FIT_PROGRAM = {
  phases: [
    { id: "return", weeks: "Week 1â€“3", title: "Terugkomen", rir: "3â€“4 RIR", description: "Rustig opnieuw wennen. Beheerst tempo, geen sets tot falen.", setDelta: -1 },
    { id: "deload1", weeks: "Week 4", title: "Herstelweek", rir: "4 RIR", description: "Ongeveer 30% minder werk. Houd iedere herhaling soepel.", setDelta: -1 },
    { id: "build", weeks: "Week 5â€“7", title: "Opbouwen", rir: "1â€“2 RIR", description: "Voeg gewicht of herhalingen toe zodra je de range beheerst.", setDelta: 0 },
    { id: "deload2", weeks: "Week 8", title: "Herstelweek", rir: "3â€“4 RIR", description: "Minder sets, dezelfde techniek. Je hoort frisser te eindigen.", setDelta: -1 },
    { id: "grow", weeks: "Week 9â€“11", title: "Groeiblok", rir: "1â€“2 RIR", description: "Stevig trainen; alleen bij veilige isolatie mag de laatste set bijna tot falen.", setDelta: 0 },
    { id: "consolidate", weeks: "Week 12", title: "Sterk afsluiten", rir: "2 RIR", description: "Bevestig je vooruitgang met nette herhalingen. Geen maximale krachttest.", setDelta: 0 }
  ],
  workouts: [
    {
      id: "push", day: "Maandag", title: "Push", subtitle: "Borst Â· schouders Â· triceps", duration: "55â€“65 min", icon: "â†—",
      exercises: [
        { id: "bike-warmup", name: "SB20 warming-up", equipment: "Stages SB20", sets: 1, reps: "6â€“8 min", rest: 0, type: "time", tip: "Rustig tempo: je moet gemakkelijk kunnen praten." },
        { id: "ft2-bench", name: "Bench press", equipment: "Inspire FT2 + bank", sets: 3, reps: "8â€“12", rest: 90, tip: "Schouderbladen laag en naar elkaar; voeten stabiel." },
        { id: "incline-db", name: "Incline dumbbell press", equipment: "MX80 of Bowflex + bank", sets: 3, reps: "8â€“12", rest: 90, tip: "Bank op circa 30Â°. Laat de dumbbells beheerst zakken." },
        { id: "cable-fly", name: "Cable fly", equipment: "Inspire FT2", sets: 3, reps: "12â€“15", rest: 60, tip: "Houd lichte buiging in de elleboog en knijp de borst samen." },
        { id: "db-shoulder", name: "Zittende shoulder press", equipment: "Dumbbells + bank", sets: 3, reps: "8â€“12", rest: 90, tip: "Ribben laag; stop vÃ³Ã³r een pijnlijke schouderpositie." },
        { id: "lateral-raise", name: "Lateral raise", equipment: "Dumbbells of kabels", sets: 3, reps: "12â€“18", rest: 60, tip: "Licht gewicht, leid met de ellebogen en niet met de handen." },
        { id: "pushdown", name: "Triceps pushdown", equipment: "Inspire FT2", sets: 3, reps: "10â€“15", rest: 60, tip: "Bovenarmen stil langs je romp." }
      ]
    },
    {
      id: "legs", day: "Dinsdag", title: "Benen & core", subtitle: "Gecontroleerd Â· enkelvriendelijk", duration: "55â€“65 min", icon: "â—‡",
      exercises: [
        { id: "bike-legs", name: "SB20 warming-up", equipment: "Stages SB20", sets: 1, reps: "7â€“8 min", rest: 0, type: "time", tip: "Lage weerstand en vloeiende trapbeweging. Stop als de enkel reageert." },
        { id: "goblet-box", name: "Goblet squat naar bank", equipment: "Kettlebell of dumbbell + bank", sets: 3, reps: "8â€“12", rest: 90, ankle: true, tip: "Tik de bank licht aan. Kies een pijnvrije diepte en houd de hele voet belast." },
        { id: "leg-extension", name: "Leg extension", equipment: "FT2 beenuitbreiding", sets: 3, reps: "10â€“15", rest: 75, tip: "Strek beheerst en laat het gewicht niet vallen." },
        { id: "db-rdl", name: "Dumbbell Romanian deadlift", equipment: "MX80 of Bowflex", sets: 3, reps: "8â€“12", rest: 90, tip: "Heupen naar achteren, rug neutraal, dumbbells dicht langs de benen." },
        { id: "supported-split", name: "Ondersteunde split squat", equipment: "FT2 staander + dumbbell", sets: 2, reps: "8â€“10/been", rest: 90, ankle: true, tip: "Houd je vast. Kleine, stabiele pas; vervang bij enkelpijn door extra leg extensions." },
        { id: "leg-curl", name: "Lying leg curl", equipment: "FT2 beenuitbreiding + bank", sets: 3, reps: "10â€“15", rest: 75, tip: "Heupen tegen de bank en een rustige excentrische fase." },
        { id: "calf-raise", name: "Standing calf raise", equipment: "Lichaamsgewicht / lichte dumbbells", sets: 2, reps: "12â€“15", rest: 60, ankle: true, tip: "Alleen pijnvrij en zonder napijn of zwelling. Anders overslaan." },
        { id: "plank", name: "Plank", equipment: "Mat", sets: 3, reps: "30â€“45 sec", rest: 60, type: "time", tip: "Span billen en buik aan; houd je rug neutraal." }
      ]
    },
    {
      id: "pull", day: "Donderdag", title: "Pull", subtitle: "Rug Â· achterste schouder Â· biceps", duration: "50â€“60 min", icon: "â†",
      exercises: [
        { id: "bike-pull", name: "SB20 warming-up", equipment: "Stages SB20", sets: 1, reps: "6 min", rest: 0, type: "time", tip: "Rustig op gang komen." },
        { id: "lat-pulldown", name: "Lat pulldown", equipment: "Inspire FT2", sets: 3, reps: "8â€“12", rest: 90, tip: "Trek de ellebogen naar je zij en houd je borst trots." },
        { id: "seated-row", name: "Seated cable row", equipment: "Inspire FT2", sets: 3, reps: "8â€“12", rest: 90, tip: "Begin met de schouderbladen en vermijd achterover zwaaien." },
        { id: "one-arm-row", name: "One-arm dumbbell row", equipment: "MX80/Bowflex + bank", sets: 3, reps: "10â€“12/arm", rest: 75, tip: "Steun stevig op de bank en trek richting je heup." },
        { id: "face-pull", name: "Face pull", equipment: "Inspire FT2 + touw", sets: 3, reps: "12â€“18", rest: 60, tip: "Trek naar ooghoogte en draai de handen iets naar buiten." },
        { id: "cable-curl", name: "Cable curl", equipment: "Inspire FT2", sets: 3, reps: "10â€“15", rest: 60, tip: "Elleboog blijft onder de schouder; geen heupzwaai." },
        { id: "hammer-curl", name: "Hammer curl", equipment: "Dumbbells", sets: 2, reps: "10â€“15", rest: 60, tip: "Neutrale pols en gecontroleerd laten zakken." }
      ]
    },
    {
      id: "full", day: "Zaterdag", title: "Full body", subtitle: "Techniek Â· volume Â· conditie", duration: "55â€“65 min", icon: "ï¼‹",
      exercises: [
        { id: "bike-full", name: "SB20 warming-up", equipment: "Stages SB20", sets: 1, reps: "6â€“8 min", rest: 0, type: "time", tip: "Rustig tempo." },
        { id: "db-bench", name: "Dumbbell bench press", equipment: "MX80 of Bowflex + bank", sets: 3, reps: "8â€“12", rest: 90, tip: "Beheerst zakken en stop met 1â€“4 herhalingen over, passend bij de fase." },
        { id: "box-squat", name: "Box squat", equipment: "Kettlebell/dumbbell + plyobox", sets: 3, reps: "8â€“12", rest: 90, ankle: true, tip: "Gebruik de 50 of 60 cm hoogte. Geen sprong; zit zacht en sta stabiel op." },
        { id: "cable-row-full", name: "Cable row", equipment: "Inspire FT2", sets: 3, reps: "10â€“12", rest: 90, tip: "Volledige, pijnvrije bewegingsuitslag." },
        { id: "kb-rdl", name: "Kettlebell Romanian deadlift", equipment: "Zeus kettlebell(s)", sets: 3, reps: "10â€“15", rest: 75, tip: "Voel rek in de hamstrings en houd de last dicht bij je." },
        { id: "cable-lateral", name: "Cable lateral raise", equipment: "Inspire FT2", sets: 2, reps: "12â€“18", rest: 60, tip: "Lage kabelstand; gecontroleerde beweging." },
        { id: "farmer-carry", name: "Farmer carry", equipment: "MX80 of kettlebells", sets: 3, reps: "30â€“45 sec", rest: 60, type: "time", ankle: true, tip: "Korte rustige passen. Bij enkelreactie: sta stil en houd de gewichten vast." },
        { id: "bike-finish", name: "SB20 rustige afsluiting", equipment: "Stages SB20", sets: 1, reps: "10â€“15 min", rest: 0, type: "time", tip: "Zone 2: je kunt nog in zinnen praten." }
      ]
    }
  ]
};

