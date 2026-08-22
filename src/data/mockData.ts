import { Song, PricingPlan, StyleOption, VoiceOption } from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'esencial',
    name: 'Canción Esencial',
    price: '19,90 €',
    priceNumber: 19.90,
    period: 'Pago único',
    description: 'Perfecto para proyectos personales rápidos.',
    durationText: '1-2 minutos de duración',
    revisionsText: '1 revisión incluida',
    qualityText: 'Audio estándar (MP3 320kbps)',
    deliveryText: 'Entrega digital tras producción',
    commercialRights: false,
    stems: false,
    features: [
      { text: '1-2 minutos de duración', included: true, icon: 'check' },
      { text: '1 revisión incluida', included: true, icon: 'check' },
      { text: 'Audio estándar (MP3 320kbps)', included: true, icon: 'check' },
      { text: 'Entrega digital tras producción', included: true, icon: 'check' },
      { text: 'Derechos comerciales', included: false, icon: 'close' },
      { text: 'Archivos multipista (Stems)', included: false, icon: 'close' },
    ],
  },
  {
    id: 'premium',
    name: 'Canción Premium',
    price: '34,90 €',
    priceNumber: 34.90,
    period: 'Pago único',
    description: 'El estándar de la industria para creadores y regalos inolvidables.',
    popular: true,
    recommended: true,
    durationText: '2-3 minutos de duración (hasta 5 min)',
    revisionsText: '3 revisiones incluidas',
    qualityText: 'Audio HD (WAV 24-bit Lossless)',
    deliveryText: 'Entrega digital tras producción + Stems',
    commercialRights: true,
    stems: true,
    features: [
      { text: 'Canciones completas (hasta 5 min)', included: true, highlight: true, icon: 'star' },
      { text: 'Revisiones ilimitadas', included: true, highlight: true, icon: 'star' },
      { text: 'Calidad WAV (Lossless 24-bit)', included: true, highlight: true, icon: 'star' },
      { text: 'Descarga multipista (Stems)', included: true, highlight: true, icon: 'star' },
      { text: 'Derechos comerciales incluidos', included: true, highlight: true, icon: 'star' },
      { text: 'Carátula personalizada en alta resolución', included: true, highlight: true, icon: 'star' },
    ],
  },
  {
    id: 'profesional',
    name: 'Canción Profesional',
    price: '59,90 €',
    priceNumber: 59.90,
    period: 'Pago único',
    description: 'Control total para productores y proyectos de gran impacto comercial.',
    durationText: '3-5 minutos de duración',
    revisionsText: 'Revisiones ilimitadas prioritarias',
    qualityText: 'Audio Master Calidad de Estudio',
    deliveryText: 'Entrega digital tras producción + Stems + MIDI',
    commercialRights: true,
    stems: true,
    features: [
      { text: 'Todo lo incluido en Premium', included: true, icon: 'check' },
      { text: 'Licencia comercial total internacional', included: true, icon: 'check' },
      { text: 'Acceso a modelos y stems individuales', included: true, icon: 'check' },
      { text: 'Soporte prioritario 24/7 con productor', included: true, icon: 'check' },
      { text: 'Archivos por pistas (Stems) + MIDI', included: true, icon: 'hotel_class' },
    ],
  },
];

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'rock',
    name: 'Rock Moderno',
    icon: '🎸',
    vibe: 'Enérgico & Potente',
    subVibe: 'Modern Rock Grit',
    bpm: 'BPM: 110-150',
    bpmNumber: 135,
    description: 'Guitarras con carácter, batería contundente y mucha pasión para historias intensas y emotivas.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADF7KVFYLSVVwpGE4bLWGUh5WAn5NqOASFaMJMtWYggNxWOeV6XpgwOyBP_yHx00NltOJ64aCtImm7dDbZM29UabXQdEg0QiiWNT-Y6JGuNmWTQO8pVXO5RXVooQ6ACVn_j_2Rdg7R9wDADfvUDwt9jz4BN6vyohFipkSLVSNwyU5uffKnUyWzzQ7Qw24Qgo_IXTW5wkL75KMUtafsZib3uSmzB6kctXv3SlRTmu5scZ7PvcL0BzyZ',
    accentColor: '#fb7185',
    tagColor: '#3cddc7',
    audioKey: 'rock',
    featured: true,
  },
  {
    id: 'pop',
    name: 'Pop Balada',
    icon: '🎹',
    vibe: 'Emocional & Radiante',
    subVibe: 'Stadium Anthem',
    bpm: 'BPM: 120-140',
    bpmNumber: 128,
    description: 'Melodías pegadizas, piano brillante y energía positiva ideal para celebrar momentos felices.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHqk0K5DYH7XMO6LLDWxSVOH0h3OxpY4QUNCoLcwxkNvDhvHvqG1joJN6kGQZ51FseYTeba6U3L_0FRaRVzg6DFS6qX_OTQ3U6y0k8n4fMKs-BmKOUBT90ehFKegbhrDZ7QbTGSa0Q7NeQM04CMDQKpi3oEmsYGLfC4YyS_BftSu5Sq9s7YVZOErWIZRWa4NjNnz_VzbRehUZkvkuAly4OOuTXaDG6v5dcQeZR4av64i0rRqiNivk0',
    accentColor: '#3cddc7',
    tagColor: '#fb7185',
    audioKey: 'pop',
    featured: true,
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Beats',
    icon: '🎧',
    vibe: 'Relajado & Íntimo',
    subVibe: 'Midnight Coffee',
    bpm: 'BPM: 70-90',
    bpmNumber: 80,
    description: 'Beats cálidos y nostálgicos, teclados vintage y atmósfera reconfortante para momentos íntimos.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbDTk6CLGdfcMFVeO7rcf6sSYPt9cmBb0VsJ3fPRWk3oVbLC7-mcoFx_34iGoZRtZXr1PlOqL3_iLbqKC0Q-R1bqjzXP1iu-iiRQc-RDfO45gN-85EtXjfqL17MgoP2JLvSWd-IOuWJsee7VxnXXvfJDRanYJEYwQbxF94xLKgvIXO9T0YouFSP-OQz6WsEvRA5iXrnjdZgbDDVqfhb--6gm5BVucqBMeUdPhq_odeswlHHbZeg7Ug',
    accentColor: '#fbbf24',
    tagColor: '#fbbf24',
    audioKey: 'lofi',
    featured: true,
  },
  {
    id: 'jazz',
    name: 'Jazz Smooth',
    icon: '🎷',
    vibe: 'Sofisticado & Elegante',
    subVibe: 'Velvet Lounge',
    bpm: 'BPM: 85-115',
    bpmNumber: 95,
    description: 'Armonías ricas, viento madera, trompeta sedosa y un toque de clase atemporal.',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&auto=format&fit=crop&q=80',
    accentColor: '#c084fc',
    tagColor: '#c084fc',
    audioKey: 'jazz',
    featured: true,
  },
  {
    id: 'orquestal',
    name: 'Orquestal',
    icon: '🎻',
    vibe: 'Épico & Cinematográfico',
    subVibe: 'Cinematic Symphony',
    bpm: 'BPM: 75-125',
    bpmNumber: 100,
    description: 'Arreglos de cuerdas, metales majestuosos y percusión épica para homenajes solemnes e inolvidables.',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    accentColor: '#38bdf8',
    tagColor: '#38bdf8',
    audioKey: 'orquestal',
    featured: true,
  },
  {
    id: 'acustico',
    name: 'Acústico',
    icon: '🎙️',
    vibe: 'Íntimo & Puro',
    subVibe: 'Warm Acoustic Folk',
    bpm: 'BPM: 80-105',
    bpmNumber: 88,
    description: 'Guitarras de madera, piano delicado y percusión acústica con todo el foco en el sentimiento vocal.',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&auto=format&fit=crop&q=80',
    accentColor: '#4ade80',
    tagColor: '#4ade80',
    audioKey: 'acustico',
    featured: true,
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop',
    icon: '🎤',
    vibe: 'Urbano & Rítmico',
    subVibe: 'Boom Bap Street',
    bpm: 'BPM: 80-100',
    bpmNumber: 90,
    description: 'Bases contundentes, bajos profundos y groove callejero para historias con actitud y flow.',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    accentColor: '#f97316',
    tagColor: '#f97316',
    audioKey: 'hiphop',
  },
  {
    id: 'rap',
    name: 'Rap',
    icon: '🔊',
    vibe: 'Directo & Lírico',
    subVibe: 'Punchline Flow',
    bpm: 'BPM: 85-105',
    bpmNumber: 95,
    description: 'Versos rápidos y rimas afiladas sobre un beat seco, ideal para contar tu historia sin filtros.',
    imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500&auto=format&fit=crop&q=80',
    accentColor: '#eab308',
    tagColor: '#eab308',
    audioKey: 'rap',
  },
  {
    id: 'punk',
    name: 'Punk',
    icon: '🧷',
    vibe: 'Rebelde & Acelerado',
    subVibe: 'Garage Rebellion',
    bpm: 'BPM: 150-200',
    bpmNumber: 175,
    description: 'Guitarras sucias, tempo veloz y espíritu inconformista para mensajes sin ataduras.',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80',
    accentColor: '#ef4444',
    tagColor: '#ef4444',
    audioKey: 'punk',
  },
  {
    id: 'metal',
    name: 'Heavy Metal',
    icon: '🤘',
    vibe: 'Intenso & Oscuro',
    subVibe: 'Distorted Power',
    bpm: 'BPM: 120-180',
    bpmNumber: 150,
    description: 'Riffs distorsionados, doble bombo y una fuerza arrolladora para himnos imparables.',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    accentColor: '#94a3b8',
    tagColor: '#94a3b8',
    audioKey: 'metal',
  },
  {
    id: 'reggaeton',
    name: 'Reguetón',
    icon: '🔥',
    vibe: 'Caliente & Bailable',
    subVibe: 'Dembow Latino',
    bpm: 'BPM: 88-100',
    bpmNumber: 95,
    description: 'Ritmo dembow, bajos pegajosos y flow latino para celebraciones que no paran de bailar.',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    accentColor: '#ec4899',
    tagColor: '#ec4899',
    audioKey: 'reggaeton',
  },
  {
    id: 'electronica',
    name: 'Electrónica',
    icon: '🎛️',
    vibe: 'Vibrante & Futurista',
    subVibe: 'Neon Club Drive',
    bpm: 'BPM: 118-135',
    bpmNumber: 126,
    description: 'Sintetizadores brillantes, drops envolventes y energía de pista para momentos épicos.',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&auto=format&fit=crop&q=80',
    accentColor: '#22d3ee',
    tagColor: '#22d3ee',
    audioKey: 'electronica',
  },
  {
    id: 'flamenco',
    name: 'Flamenco',
    icon: '💃',
    vibe: 'Pasional & Español',
    subVibe: 'Duende Andaluz',
    bpm: 'BPM: 90-130',
    bpmNumber: 110,
    description: 'Guitarra española, palmas y compás con duende para dedicatorias llenas de sentimiento.',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&auto=format&fit=crop&q=80',
    accentColor: '#f43f5e',
    tagColor: '#f43f5e',
    audioKey: 'flamenco',
  },
  {
    id: 'rnb',
    name: 'R&B',
    icon: '🎶',
    vibe: 'Sensual & Suave',
    subVibe: 'Silk Soul',
    bpm: 'BPM: 60-90',
    bpmNumber: 75,
    description: 'Voces aterciopeladas, acordes cálidos y groove sedoso para declaraciones románticas.',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    accentColor: '#a78bfa',
    tagColor: '#a78bfa',
    audioKey: 'rnb',
  },
  {
    id: 'cinematografico',
    name: 'Cinematográfico',
    icon: '🎬',
    vibe: 'Épico & Emotivo',
    subVibe: 'Movie Score',
    bpm: 'BPM: 60-110',
    bpmNumber: 85,
    description: 'Atmósferas de banda sonora, crescendos emocionantes y grandeza de película para tu historia.',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80',
    accentColor: '#818cf8',
    tagColor: '#818cf8',
    audioKey: 'cinematografico',
  },
];

/** Estilos destacados en la portada (mantiene el diseño original del showcase). */
export const FEATURED_STYLE_OPTIONS: StyleOption[] = STYLE_OPTIONS.filter((s) => s.featured);

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'masc-1',
    name: 'Voz Masculina 1',
    gender: 'masculino',
    badge: 'Pop Moderno',
    tone: 'Tono brillante, fresco y versátil',
    description: 'Ideal para temas pop, urbanos y canciones rítmicas con gran claridad vocal.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    audioSampleKey: 'masculino',
  },
  {
    id: 'masc-2',
    name: 'Voz Masculina 2',
    gender: 'masculino',
    badge: 'Acústico & Rock',
    tone: 'Tono cálido, rasposo y emotivo',
    description: 'Perfecto para baladas intensas, rock y dedicatorias cargadas de sentimiento sincero.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcg8sQdGcxXVdBPWNorXPvX92vtsdeazaSj39Kj-oGYGbgTHHxFb1BmWwJrDRVObvCTC0xHInV7bEmai-eK9Ek9GDR29gTAkk3Uh_fjQizu8aF0vQROFiLO8y6406QZMBXn69F3693VZPjZ_edIrDEtq0WkMQA9FpaD1xsOY9Z4oMsOhluCe6dtZmZcu0DcUaDDvPzznVweIadQ16pGgGfAHUziLRA-kbWVb-FamkWSx_cNfsARBsS',
    audioSampleKey: 'masculino',
  },
  {
    id: 'fem-1',
    name: 'Voz Femenina 1',
    gender: 'femenino',
    badge: 'Dulce & Acústica',
    tone: 'Tono suave, aireado y conmovedor',
    description: 'Excelente para homenajes familiares, aniversarios y momentos íntimos llenos de ternura.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    audioSampleKey: 'femenino',
  },
  {
    id: 'fem-2',
    name: 'Voz Femenina 2',
    gender: 'femenino',
    badge: 'Potente & Soul',
    tone: 'Tono poderoso, expresivo y con cuerpo',
    description: 'Capaz de alcanzar notas altas y transmitir fuerza en himnos emotivos y celebraciones.',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    audioSampleKey: 'femenino',
  },
  {
    id: 'duo-1',
    name: 'Dúo Armónico',
    gender: 'duo',
    badge: 'Armonía Dual',
    tone: 'Fusión masculina + femenina',
    description: 'Armonías a dos voces que dialogan en estrofas y se unen en coros épicos.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    audioSampleKey: 'duo',
  },
];

export const INSPIRATION_IDEAS = [
  {
    title: 'Aniversario romántico',
    icon: 'favorite',
    color: '#fb7185',
    text: 'Nuestros primeros 5 años juntos. Empezó como una amistad en la cafetería del centro y ahora construimos nuestro hogar. La lluvia aquella tarde y el café caliente que compartimos.',
    tags: ['Amor', 'Aniversario', 'Nostalgia'],
  },
  {
    title: 'Cumpleaños sorpresa',
    icon: 'celebration',
    color: '#3cddc7',
    text: 'Para mi madre en sus 60 años. Siempre se ha sacrificado por nosotros, le encanta el mar, la música de los 80 y regar las plantas al amanecer. Queremos agradecerle todo su cariño.',
    tags: ['Familia', 'Cumpleaños', 'Gratitud'],
  },
  {
    title: 'Despedida de mascota',
    icon: 'cruelty_free',
    color: '#fbbf24',
    text: 'Un homenaje a Max, nuestro golden retriever de 12 años. Sus paseos por el parque en otoño, cómo corría tras la pelota y cómo nos recibía moviendo la cola cada tarde.',
    tags: ['Homenaje', 'Mascota', 'Recuerdo'],
  },
  {
    title: 'Viaje con amigos inolvidable',
    icon: 'flight_takeoff',
    color: '#c0c1ff',
    text: 'Aquel viaje por la costa en furgoneta el verano después de graduarnos. Las noches de fogata en la playa, canciones desafinadas con la guitarra y la promesa de no perder el contacto.',
    tags: ['Amistad', 'Viaje', 'Aventura'],
  },
];

export const OCCASIONS = [
  'Aniversario (1 año)',
  'Aniversario (5 años)',
  'Aniversario (10 años)',
  'Cumpleaños',
  'Boda',
  'Pedida de mano',
  'Agradecimiento / Homenaje',
  'Despedida / Mudanza',
  'Graduación',
  'Nuevo Bebé',
  'Declaración de Amor',
  'Amistad Verdadera',
];

export const INITIAL_SONGS: Song[] = [
  {
    id: 'song-1',
    title: 'El Viaje de Sofía',
    subtitle: 'Generado por Melody AI',
    author: 'Melody AI Studio',
    genre: 'Pop',
    genreVibe: 'Monumental Stadium Anthem',
    voiceName: 'Voz Femenina 1 (Dulce)',
    duration: 192,
    bpm: 124,
    story: 'Una historia sobre superar miedos, salir a explorar el mundo y encontrar la propia voz en una gran ciudad iluminada de luces y esperanza.',
    dedication: {
      to: 'Sofía',
      from: 'Sus padres',
      occasion: 'Graduación Universitaria',
      message: 'Vuela alto y nunca dejes de soñar.',
    },
    lyrics: `[Verso 1]
Hiciste las maletas con el alba
un billete de ida hacia el mar
tantas dudas guardadas en el alma
pero con ganas de empezar a volar.

[Coro]
Es tu viaje, Sofía, mira el horizonte brillar
cada paso que diste te trajo a este lugar
no hay tormenta que apague tu luz
el mundo entero espera por ti.

[Verso 2]
Las luces de la ciudad te dan la bienvenida
un nuevo capítulo empieza a sonar
recuerda de dónde vienes, querida
que el amor de casa siempre te va a cuidar.`,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-kYDRpt3JOddwUtrzLDqx1gVPj5y5o58l32yR5FwrD27CW267B7bTnn_Qdg79UdNDyft1bBZhk9YgbAMzdZxsJdczKZjjFHIRQa0C32s9p-3Vts7S_gvAC_CPTI9X72UJS6BSP2Co0-gcuV1bH7efE8Zy4SNXrnrGGZShNH_MvS4cb92smRPcwBpxwmSQQM1cqKbW7J6OBB6S8JD5xDNbSE2OqYwuiRlmf0W1gwIsQo1udquIY6L1',
    createdAt: 'Hace 2 horas',
    planId: 'premium',
    status: 'ready',
    revisionsLeft: 3,
    isFavorite: true,
    tags: ['Pop', 'Superación', 'Graduación'],
    audioKey: 'pop',
  },
  {
    id: 'song-2',
    title: 'Neon Horizon',
    subtitle: 'Generado por Melody AI',
    author: 'Melody AI Studio',
    genre: 'Urbano',
    genreVibe: 'Futuristic Neo-Urban Synth',
    voiceName: 'Voz Masculina 1 (Pop Moderno)',
    duration: 222,
    bpm: 98,
    story: 'Conducir de noche por avenidas iluminadas con luces de neón recordando una mirada inolvidable.',
    dedication: {
      to: 'Elena',
      from: 'Marcos',
      occasion: 'Aniversario',
      message: 'Por todos los kilómetros que aún nos quedan por recorrer juntos.',
    },
    lyrics: `[Intro]
Luces de neón en el retrovisor...
La ciudad no duerme, nosotros tampoco.

[Verso 1]
Medianoche en la autopista central
el reflejo violeta en el cristal
un synthwave suave sonando en la radio
y tu recuerdo acelerando mis latidos.

[Coro]
Neon Horizon, perdidos en la noche
bajo un cielo eléctrico sin reproche
si me miras así nada puede salir mal
este amor es como un viaje espacial.`,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA19VW_F13qxWjOtifwmpAZzkgCN9OxW2Z3xF0cmhaY5nOROq-d192R2cFXFTTrCbcAeGq7eLYk9kMBMJruAGjToGOvWBX0VhrLMRG2qW0bTMG816IhyMHg7ox3mPMxFS0-XoNJZU30Ey5GF3O4UV6aBXqdj9n_rgjYOxd4ckdIUc-_EE7jhAy88UTwO_FzWuCRZxWGZaDUxF9QZ3LvtLgyMqQ0jvIBZ5n8VqQjnlPLwyLKQr8S4je7',
    createdAt: 'Ayer',
    planId: 'premium',
    status: 'ready',
    revisionsLeft: 2,
    isFavorite: false,
    tags: ['Synthwave', 'Urbano', 'Noche'],
    audioKey: 'urbano',
  },
  {
    id: 'song-3',
    title: 'El Viaje de Ayer',
    subtitle: 'Carlos y Laura',
    author: 'Melody AI Studio',
    genre: 'Rock',
    genreVibe: 'Intimate Underground Grit',
    voiceName: 'Voz Masculina 2 (Cálido & Rasposo)',
    duration: 240,
    bpm: 110,
    story: 'Un viaje por carretera a través de la costa oeste en un descapotable antiguo. El sol poniéndose sobre el océano y una década de amor verdadero.',
    dedication: {
      to: 'Carlos y Laura',
      from: 'Carlos',
      occasion: 'Aniversario (10 años)',
      message: 'Diez años después, sigo eligiéndote cada día.',
    },
    lyrics: `[Verso 1]
Un descapotable viejo y la carretera abierta
la brisa marina golpeando la puerta
diez años pasaron como un suspiro
y aún me pierdo cada vez que te miro.

[Coro]
Es el viaje de ayer que nunca terminó
el fuego en el pecho que nunca se apagó
contra el viento y las olas supimos remar
y hoy volvemos a orillas del mar.`,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ8GJ0pqw1HPJQUXwax0RXqS5V3M463j3rujjip6ftXqWHfHvoroGY37k2gju0O211WuXtEqntW58myjOe0plKaCWHcscBQhISnB7rpDXIp0c1dsQ4XzRz0i3I_koEBJp4oDCqO_Bpw68Zp347Y5RZ7JLULajgPCztRQHOmOpAyi2Rs2jTP2KAliY_vJMTmIdg5GZXXqoli3CsNSSDz1aG1dyjYv-MC-20mVUN6VfwMggX6U07hLO8',
    createdAt: 'Hace 3 días',
    planId: 'profesional',
    status: 'ready',
    revisionsLeft: 5,
    isFavorite: true,
    tags: ['Indie Pop', '10 Años', 'Amor'],
    audioKey: 'rock',
  },
  {
    id: 'song-4',
    title: 'Atardecer en la Costa',
    subtitle: 'Generado por Melody AI',
    author: 'Melody AI Studio',
    genre: 'Lo-Fi Chill',
    genreVibe: 'Relaxed Midnight Coffee',
    voiceName: 'Voz Femenina 2 (Potente & Soul)',
    duration: 175,
    bpm: 80,
    story: 'Paseo tranquilo por la playa al atardecer, escuchando las olas y encontrando paz interior.',
    dedication: {
      to: 'Para mí mismo',
      from: 'Autor',
      occasion: 'Paz Interior',
      message: 'Un respiro para recargar el alma.',
    },
    lyrics: `[Verso 1]
La arena suave bajo mis pies
el cielo dorado cayendo otra vez
no hay prisas, no hay ruido, solo el rumor
del mar despidiendo con calma al sol.

[Coro]
Respira profundo, déjate llevar
la marea tranquila te enseña a flotar
en cada silencio hay una canción
que cura las heridas del corazón.`,
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    createdAt: 'Hace 5 días',
    planId: 'esencial',
    status: 'ready',
    revisionsLeft: 1,
    isFavorite: false,
    tags: ['Lo-Fi', 'Calma', 'Playa'],
    audioKey: 'lofi',
  }
];

export const SAMPLE_SONGS = INITIAL_SONGS;
