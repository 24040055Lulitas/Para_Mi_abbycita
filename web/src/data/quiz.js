/* Quiz "¿Cuánto te acuerdas de nosotros?"
   Seis burbujas repartidas por la pantalla; cada una es una pregunta.
   - topic: lo que se lee en la burbuja antes de abrirla
   - answer: índice (0–3) de la opción correcta
   - note: lo que aparece después de contestar
   Las respuestas salen de la línea del tiempo y de la carta; revisa que
   todas sean correctas y cambia lo que quieras. */

export const QUIZ = [
  {
    topic: 'cómo empezó',
    question: '¿Cómo empezó todo entre nosotros?',
    options: ['En la escuela', 'Con un match', 'Por un amigo en común', 'En un concierto'],
    answer: 1,
    note: 'Un match que terminó siendo la mejor casualidad de mi vida.',
  },
  {
    topic: 'las flores',
    question: '¿Qué día te di tus primeras flores?',
    options: ['14 de febrero', '13 de septiembre', '23 de agosto', '1 de agosto'],
    answer: 2,
    note: 'El 23 de agosto. Y todavía me acuerdo de tu cara al verlas.',
  },
  {
    topic: 'el té',
    question: 'En nuestro té de burbujas, ¿qué sabor fue el tuyo?',
    options: ['Taro', 'Matcha', 'Fresa', 'Ferrero'],
    answer: 3,
    note: 'Ferrero para ti, Taro para mí… con tu nombre escrito en el vaso.',
  },
  {
    topic: 'nuestra hija',
    question: '¿Cómo se llama nuestra hija de peluche?',
    options: ['Rex', 'Mochi', 'Neeko', 'Kiki'],
    answer: 2,
    note: 'Neeko, la más consentida de la familia.',
  },
  {
    topic: 'la canción',
    question: '¿Qué canción sonó cuando entraste por primera vez a tu lugar?',
    options: ['bad guy', 'i love you', 'Happier Than Ever', 'BLUE'],
    answer: 1,
    note: '«i love you». Y no fue casualidad.',
  },
  {
    topic: 'tu lugar',
    question: 'Cuando me contaste lo que es la música de Billie para ti, ¿cómo la llamaste?',
    options: ['Mi refugio', 'Mi canción', 'Mi lugar', 'Mi calma'],
    answer: 2,
    note: '"Es simplemente mi lugar." Por eso todo esto se llama así.',
  },
];

/* mensajes del resultado, del puntaje más alto al más bajo */
export const QUIZ_RESULTS = [
  {
    min: 6,
    title: '¡Perfecto!',
    text: 'Te acuerdas de todo. Ahora sé que no soy el único que guarda cada momento.',
  },
  {
    min: 4,
    title: '¡Casi todo!',
    text: 'Te acuerdas de lo importante, y lo que se te fue, te lo vuelvo a contar las veces que quieras.',
  },
  {
    min: 2,
    title: 'Vamos bien',
    text: 'Algunas se te escaparon, pero eso solo significa que nos toca crear más recuerdos.',
  },
  {
    min: 0,
    title: 'Oye…',
    text: 'JAJAJA no pasa nada. Lo bueno es que tenemos toda una vida para repasar.',
  },
];
