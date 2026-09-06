import { PrismaClient, Role, CommercialRequestType, CommercialRequestStatus, ActorType, TechnicalRequestStatus, TrainingModality, RegistrationStatus, PartnerType, PartnershipStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ============ USERS ============
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@senbiopest.com' },
    update: {},
    create: {
      email: 'admin@senbiopest.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Sen Biopest',
      role: Role.ADMIN,
    },
  });

  console.log('Admin user created');

  // ============ PRODUCT CATEGORIES ============
  const catInsecticide = await prisma.productCategory.upsert({
    where: { slug: 'insecticides-biologiques' },
    update: {},
    create: { name: 'Insecticides biologiques', slug: 'insecticides-biologiques', description: 'Solutions naturelles contre les insectes ravageurs' },
  });

  const catFongicide = await prisma.productCategory.upsert({
    where: { slug: 'fongicides-biologiques' },
    update: {},
    create: { name: 'Fongicides biologiques', slug: 'fongicides-biologiques', description: 'Protection naturelle contre les maladies fongiques' },
  });

  const catRepulsif = await prisma.productCategory.upsert({
    where: { slug: 'repulsifs-naturels' },
    update: {},
    create: { name: 'Répulsifs naturels', slug: 'repulsifs-naturels', description: 'Solutions répulsives à base de plantes' },
  });

  console.log('Categories created');

  // ============ CROPS ============
  const crops = await Promise.all([
    prisma.crop.upsert({ where: { slug: 'tomate' }, update: {}, create: { name: 'Tomate', slug: 'tomate' } }),
    prisma.crop.upsert({ where: { slug: 'oignon' }, update: {}, create: { name: 'Oignon', slug: 'oignon' } }),
    prisma.crop.upsert({ where: { slug: 'chou' }, update: {}, create: { name: 'Chou', slug: 'chou' } }),
    prisma.crop.upsert({ where: { slug: 'piment' }, update: {}, create: { name: 'Piment', slug: 'piment' } }),
    prisma.crop.upsert({ where: { slug: 'aubergine' }, update: {}, create: { name: 'Aubergine', slug: 'aubergine' } }),
    prisma.crop.upsert({ where: { slug: 'gombo' }, update: {}, create: { name: 'Gombo', slug: 'gombo' } }),
    prisma.crop.upsert({ where: { slug: 'laitue' }, update: {}, create: { name: 'Laitue', slug: 'laitue' } }),
    prisma.crop.upsert({ where: { slug: 'mangue' }, update: {}, create: { name: 'Mangue', slug: 'mangue' } }),
    prisma.crop.upsert({ where: { slug: 'riz' }, update: {}, create: { name: 'Riz', slug: 'riz' } }),
    prisma.crop.upsert({ where: { slug: 'mil' }, update: {}, create: { name: 'Mil', slug: 'mil' } }),
  ]);

  console.log('Crops created');

  // ============ PESTS ============
  const pests = await Promise.all([
    prisma.pest.upsert({ where: { slug: 'pucerons' }, update: {}, create: { name: 'Pucerons', slug: 'pucerons' } }),
    prisma.pest.upsert({ where: { slug: 'mouches-blanches' }, update: {}, create: { name: 'Mouches blanches', slug: 'mouches-blanches' } }),
    prisma.pest.upsert({ where: { slug: 'chenilles' }, update: {}, create: { name: 'Chenilles', slug: 'chenilles' } }),
    prisma.pest.upsert({ where: { slug: 'acariens' }, update: {}, create: { name: 'Acariens', slug: 'acariens' } }),
    prisma.pest.upsert({ where: { slug: 'nematodes' }, update: {}, create: { name: 'Nématodes', slug: 'nematodes' } }),
    prisma.pest.upsert({ where: { slug: 'thrips' }, update: {}, create: { name: 'Thrips', slug: 'thrips' } }),
    prisma.pest.upsert({ where: { slug: 'mildiou' }, update: {}, create: { name: 'Mildiou', slug: 'mildiou' } }),
    prisma.pest.upsert({ where: { slug: 'oidium' }, update: {}, create: { name: 'Oïdium', slug: 'oidium' } }),
  ]);

  console.log('Pests created');

  // ============ TAGS ============
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'maraichage' }, update: {}, create: { name: 'Maraîchage', slug: 'maraichage' } }),
    prisma.tag.upsert({ where: { slug: 'jardinage' }, update: {}, create: { name: 'Jardinage', slug: 'jardinage' } }),
    prisma.tag.upsert({ where: { slug: 'arboriculture' }, update: {}, create: { name: 'Arboriculture', slug: 'arboriculture' } }),
    prisma.tag.upsert({ where: { slug: 'grandes-cultures' }, update: {}, create: { name: 'Grandes cultures', slug: 'grandes-cultures' } }),
  ]);

  console.log('Tags created');

  // ============ PRODUCTS ============
  // AromaProtect - Produit phare
  const aromaprotect = await prisma.product.upsert({
    where: { slug: 'aromaprotect' },
    update: {},
    create: {
      name: 'AromaProtect',
      slug: 'aromaprotect',
      shortDescription: 'Biopesticide naturel polyvalent à base de plantes aromatiques locales. Efficace contre les principaux ravageurs du maraîchage.',
      description: `AromaProtect est le produit phare de Sen Biopest. Formulé à partir d'un mélange optimisé de plantes aromatiques sénégalaises, il offre une protection naturelle et efficace contre les principaux ravageurs des cultures maraîchères.

Son mode d'action repose sur les propriétés insecticides et répulsives des huiles essentielles contenues dans les plantes utilisées. Il agit par contact et par ingestion sur les insectes nuisibles, tout en étant respectueux des insectes auxiliaires lorsqu'il est utilisé selon les recommandations.

AromaProtect est adapté à une utilisation en agriculture biologique et conventionnelle. Il ne laisse pas de résidus toxiques sur les récoltes et respecte les délais de réentrée courts, permettant un retour rapide au champ après traitement.`,
      benefits: [
        'Efficace contre pucerons, mouches blanches, chenilles et thrips',
        '100% naturel, à base de plantes locales sénégalaises',
        'Pas de résidus toxiques sur les récoltes',
        'Compatible avec l\'agriculture biologique',
        'Facile à préparer et à appliquer',
        'Respectueux des pollinisateurs quand bien utilisé',
        'Coût accessible pour les petits producteurs',
        'Fabrication locale créant de la valeur au Sénégal',
      ],
      activeIngredients: [
        'Huile essentielle de neem (Azadirachta indica)',
        'Extrait de citronnelle (Cymbopogon citratus)',
        'Huile de basilic africain (Ocimum gratissimum)',
        'Extrait d\'ail (Allium sativum)',
      ],
      dosage: '50 à 100 ml par litre d\'eau selon le niveau d\'infestation. Pulvériser uniformément sur le feuillage.',
      applicationMethod: 'Pulvérisation foliaire au coucher du soleil ou tôt le matin. Renouveler tous les 7 à 10 jours en période de forte pression. Bien agiter avant emploi.',
      precautions: 'Éviter le contact avec les yeux. Porter des gants lors de la manipulation du concentré. Ne pas pulvériser en plein soleil. Respecter un délai de 3 jours avant récolte. Stocker à l\'abri de la lumière et de la chaleur.',
      packaging: 'Bidons de 1L, 5L et 20L',
      availability: 'Disponible',
      isFeatured: true,
      isPublished: true,
      sortOrder: 1,
      categoryId: catInsecticide.id,
      metaTitle: 'AromaProtect — Biopesticide naturel polyvalent | Sen Biopest',
      metaDescription: 'AromaProtect, biopesticide naturel à base de plantes aromatiques locales. Efficace contre pucerons, mouches blanches et chenilles. Fabriqué au Sénégal.',
    },
  });

  // Link crops and pests to AromaProtect
  await prisma.cropOnProduct.createMany({
    data: [
      { productId: aromaprotect.id, cropId: crops[0]!.id }, // Tomate
      { productId: aromaprotect.id, cropId: crops[1]!.id }, // Oignon
      { productId: aromaprotect.id, cropId: crops[2]!.id }, // Chou
      { productId: aromaprotect.id, cropId: crops[3]!.id }, // Piment
      { productId: aromaprotect.id, cropId: crops[4]!.id }, // Aubergine
      { productId: aromaprotect.id, cropId: crops[5]!.id }, // Gombo
    ],
    skipDuplicates: true,
  });

  await prisma.pestOnProduct.createMany({
    data: [
      { productId: aromaprotect.id, pestId: pests[0]!.id }, // Pucerons
      { productId: aromaprotect.id, pestId: pests[1]!.id }, // Mouches blanches
      { productId: aromaprotect.id, pestId: pests[2]!.id }, // Chenilles
      { productId: aromaprotect.id, pestId: pests[5]!.id }, // Thrips
    ],
    skipDuplicates: true,
  });

  await prisma.tagOnProduct.createMany({
    data: [
      { productId: aromaprotect.id, tagId: tags[0]!.id }, // Maraîchage
      { productId: aromaprotect.id, tagId: tags[1]!.id }, // Jardinage
    ],
    skipDuplicates: true,
  });

  // AromaProtect FAQ
  await prisma.productFaq.createMany({
    data: [
      { productId: aromaprotect.id, question: 'Combien de temps après le traitement puis-je récolter ?', answer: 'Respectez un délai minimum de 3 jours entre le dernier traitement et la récolte.', sortOrder: 1 },
      { productId: aromaprotect.id, question: 'AromaProtect est-il dangereux pour les abeilles ?', answer: 'Utilisé selon les recommandations (application le soir), AromaProtect présente un risque minimal pour les pollinisateurs. Évitez de pulvériser pendant la floraison aux heures d\'activité des abeilles.', sortOrder: 2 },
      { productId: aromaprotect.id, question: 'Puis-je mélanger AromaProtect avec d\'autres produits ?', answer: 'Il est recommandé de ne pas mélanger AromaProtect avec d\'autres produits de traitement. Espacez les applications d\'au moins 48h.', sortOrder: 3 },
    ],
    skipDuplicates: true,
  });

  // NéemPro
  const neempro = await prisma.product.upsert({
    where: { slug: 'neempro' },
    update: {},
    create: {
      name: 'NéemPro',
      slug: 'neempro',
      shortDescription: 'Insecticide naturel concentré à base d\'huile de neem. Efficace contre pucerons, chenilles et acariens.',
      description: 'NéemPro est un insecticide biologique à base d\'huile de neem (Azadirachta indica), arbre répandu en Afrique de l\'Ouest. L\'azadirachtine, son principe actif principal, perturbe le développement et la reproduction des insectes nuisibles sans affecter les organismes bénéfiques.',
      benefits: [
        'Action insecticide et anti-appétante',
        'Large spectre d\'action',
        'Biodégradable et non persistant',
        'Compatible agriculture biologique',
      ],
      activeIngredients: ['Azadirachtine (huile de neem concentrée)', 'Co-formulants naturels'],
      dosage: '30 à 50 ml par litre d\'eau',
      applicationMethod: 'Pulvérisation foliaire, de préférence le soir. Traiter tous les 7 jours.',
      precautions: 'Éviter le contact avec les yeux et la peau. Stocker au frais.',
      packaging: 'Flacons de 500ml et bidons de 5L',
      availability: 'Disponible',
      isFeatured: false,
      isPublished: true,
      sortOrder: 2,
      categoryId: catInsecticide.id,
    },
  });

  // BioShield
  const bioshield = await prisma.product.upsert({
    where: { slug: 'bioshield' },
    update: {},
    create: {
      name: 'BioShield',
      slug: 'bioshield',
      shortDescription: 'Protection biologique contre les maladies fongiques. Idéal pour les cultures maraîchères.',
      description: 'BioShield est une solution fongicide biologique à base d\'extraits de plantes aux propriétés antifongiques. Il protège les cultures contre le mildiou, l\'oïdium et d\'autres maladies fongiques courantes en maraîchage.',
      benefits: [
        'Prévention et traitement des maladies fongiques',
        'Renforce les défenses naturelles des plantes',
        'Sans résidus chimiques',
        'Adapté au maraîchage bio',
      ],
      activeIngredients: ['Extraits de prêle', 'Bicarbonate de potassium', 'Huile essentielle de tea tree'],
      dosage: '40 à 60 ml par litre d\'eau en préventif',
      applicationMethod: 'Pulvérisation sur le feuillage sec. Application préventive recommandée.',
      precautions: 'Ne pas appliquer par temps de pluie. Stocker hors gel.',
      packaging: 'Flacons de 1L et bidons de 5L',
      availability: 'Disponible',
      isFeatured: false,
      isPublished: true,
      sortOrder: 3,
      categoryId: catFongicide.id,
    },
  });

  console.log('Products created');

  // ============ TRAININGS ============
  const training1 = await prisma.training.upsert({
    where: { slug: 'utilisation-biopesticides-maraichage' },
    update: {},
    create: {
      title: 'Utilisation des biopesticides en maraîchage',
      slug: 'utilisation-biopesticides-maraichage',
      description: 'Formation pratique sur l\'utilisation des biopesticides naturels dans les cultures maraîchères. Apprenez à identifier les ravageurs, choisir le bon produit et l\'appliquer correctement pour protéger vos cultures.',
      objectives: [
        'Identifier les principaux ravageurs du maraîchage au Sénégal',
        'Comprendre le mode d\'action des biopesticides',
        'Maîtriser les dosages et techniques d\'application',
        'Adopter les bonnes pratiques de protection intégrée',
      ],
      targetAudience: 'Producteurs maraîchers, groupements, coopératives',
      duration: '2 jours',
      modality: TrainingModality.PRESENTIEL,
      location: 'Centre de formation Sen Biopest, Dakar',
      date: new Date('2026-05-15'),
      endDate: new Date('2026-05-16'),
      price: 'Gratuit',
      maxParticipants: 30,
      isPublished: true,
    },
  });

  const training2 = await prisma.training.upsert({
    where: { slug: 'bonnes-pratiques-protection-cultures' },
    update: {},
    create: {
      title: 'Bonnes pratiques de protection des cultures',
      slug: 'bonnes-pratiques-protection-cultures',
      description: 'Formation en ligne sur les méthodes intégrées de lutte biologique et les stratégies préventives pour réduire l\'usage des pesticides chimiques.',
      objectives: [
        'Comprendre la lutte intégrée',
        'Identifier les auxiliaires utiles au jardin',
        'Mettre en place des rotations efficaces',
        'Utiliser les biopesticides de façon raisonnée',
      ],
      targetAudience: 'Jardiniers urbains, agriculteurs débutants',
      duration: '4 heures',
      modality: TrainingModality.EN_LIGNE,
      date: new Date('2026-06-10'),
      price: '5 000 FCFA',
      maxParticipants: 50,
      isPublished: true,
    },
  });

  console.log('Trainings created');

  // ============ FAQ ============
  await prisma.faq.createMany({
    data: [
      { question: 'Qu\'est-ce qu\'un biopesticide ?', answer: 'Un biopesticide est un produit de protection des plantes fabriqué à partir d\'organismes vivants ou de substances naturelles. Contrairement aux pesticides chimiques, ils sont respectueux de l\'environnement et de la santé.', category: 'Produits', sortOrder: 1 },
      { question: 'Les biopesticides sont-ils aussi efficaces que les pesticides chimiques ?', answer: 'Oui, lorsqu\'ils sont utilisés correctement et de manière préventive, les biopesticides offrent une protection efficace. Ils nécessitent parfois des applications plus fréquentes mais ne laissent pas de résidus toxiques.', category: 'Produits', sortOrder: 2 },
      { question: 'Comment commander vos produits ?', answer: 'Vous pouvez nous contacter via le formulaire de devis sur notre site, par WhatsApp ou par téléphone. Nous vous répondrons sous 24h avec une proposition adaptée à vos besoins.', category: 'Commandes', sortOrder: 3 },
      { question: 'Livrez-vous dans tout le Sénégal ?', answer: 'Oui, nous livrons dans les 14 régions du Sénégal. Les délais et frais de livraison varient selon la zone. Contactez-nous pour plus de détails.', category: 'Commandes', sortOrder: 4 },
      { question: 'Proposez-vous des tarifs groupés ?', answer: 'Oui, nous proposons des tarifs préférentiels pour les commandes en volume, les coopératives et les GIE. Contactez-nous pour obtenir un devis personnalisé.', category: 'Commandes', sortOrder: 5 },
      { question: 'Comment utiliser AromaProtect ?', answer: 'Diluez 50 à 100 ml d\'AromaProtect dans 1 litre d\'eau. Pulvérisez uniformément sur le feuillage le soir ou tôt le matin. Renouvelez tous les 7 à 10 jours selon la pression des ravageurs.', category: 'Utilisation', sortOrder: 6 },
      { question: 'Puis-je utiliser vos produits en agriculture biologique ?', answer: 'Oui, tous nos produits sont formulés à partir d\'ingrédients naturels et sont compatibles avec les pratiques d\'agriculture biologique.', category: 'Utilisation', sortOrder: 7 },
      { question: 'Quelles formations proposez-vous ?', answer: 'Nous proposons des formations pratiques sur l\'utilisation des biopesticides, la protection intégrée des cultures et les bonnes pratiques agricoles. Consultez notre catalogue de formations pour les prochaines sessions.', category: 'Formation', sortOrder: 8 },
      { question: 'Comment devenir partenaire de Sen Biopest ?', answer: 'Remplissez notre formulaire de partenariat en précisant votre type d\'organisation et votre proposition de collaboration. Notre équipe vous contactera pour discuter des opportunités.', category: 'Partenariats', sortOrder: 9 },
    ],
    skipDuplicates: true,
  });

  console.log('FAQs created');

  // ============ TESTIMONIALS ============
  await prisma.testimonial.createMany({
    data: [
      { authorName: 'Mamadou Diallo', authorRole: 'Producteur maraîcher', authorLocation: 'Thiès', content: 'Depuis que j\'utilise AromaProtect, mes tomates sont mieux protégées et je n\'utilise plus de produits chimiques. Mes clients apprécient la qualité de mes récoltes.', rating: 5, sortOrder: 1 },
      { authorName: 'Fatou Sow', authorRole: 'Présidente GIE Teranga', authorLocation: 'Kaolack', content: 'Sen Biopest a formé nos membres et nous a accompagnés avec des solutions adaptées. Nos récoltes sont meilleures et nos coûts de traitement ont baissé.', rating: 5, sortOrder: 2 },
      { authorName: 'Ibrahima Ndiaye', authorRole: 'Jardinier urbain', authorLocation: 'Dakar', content: 'Des produits simples à utiliser et vraiment efficaces. Je recommande Sen Biopest à tous les jardiniers qui veulent protéger leurs plantes naturellement.', rating: 4, sortOrder: 3 },
    ],
    skipDuplicates: true,
  });

  console.log('Testimonials created');

  // ============ CONTENT BLOCKS ============
  await prisma.contentBlock.upsert({
    where: { key: 'hero-home' },
    update: {},
    create: {
      key: 'hero-home',
      title: 'Protégez vos cultures naturellement',
      content: 'Sen Biopest développe des solutions biologiques efficaces contre les ravageurs, respectueuses de la santé et de l\'environnement.',
    },
  });

  await prisma.contentBlock.upsert({
    where: { key: 'about-mission' },
    update: {},
    create: {
      key: 'about-mission',
      title: 'Notre mission',
      content: 'Rendre accessible à tous les producteurs sénégalais des solutions de protection des cultures naturelles, efficaces et abordables, tout en préservant la santé des agriculteurs et de l\'environnement.',
    },
  });

  console.log('Content blocks created');

  // ============ SITE SETTINGS ============
  const settings = [
    { key: 'whatsapp_number', value: '+221770000000', label: 'Numéro WhatsApp' },
    { key: 'company_phone', value: '+221770000000', label: 'Téléphone' },
    { key: 'company_email', value: 'contact@senbiopest.com', label: 'Email' },
    { key: 'company_address', value: 'Dakar, Sénégal', label: 'Adresse' },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log('Settings created');

  // ============ SAMPLE REQUESTS ============
  await prisma.commercialRequest.create({
    data: {
      type: CommercialRequestType.DEVIS,
      status: CommercialRequestStatus.NOUVEAU,
      firstName: 'Moussa',
      lastName: 'Ba',
      phone: '+221771234567',
      email: 'moussa.ba@email.com',
      organization: 'GIE Ndiaganiao',
      actorType: ActorType.COOPERATIVE,
      locality: 'Ndiaganiao',
      region: 'Thiès',
      productInterest: 'AromaProtect',
      quantity: '20 litres',
      cropConcerned: 'Tomate',
      message: 'Nous souhaitons commander 20 litres d\'AromaProtect pour notre groupement de 15 producteurs maraîchers.',
      consent: true,
      source: 'site-web',
    },
  });

  await prisma.commercialRequest.create({
    data: {
      type: CommercialRequestType.COMMANDE,
      status: CommercialRequestStatus.EN_COURS,
      firstName: 'Awa',
      lastName: 'Fall',
      phone: '+221779876543',
      actorType: ActorType.JARDINIER,
      locality: 'Almadies',
      region: 'Dakar',
      productInterest: 'NéemPro',
      quantity: '2 flacons de 500ml',
      message: 'Je cherche un produit bio pour mes plantes de balcon.',
      consent: true,
      source: 'whatsapp',
      assignedToId: admin.id,
    },
  });

  await prisma.technicalRequest.create({
    data: {
      status: TechnicalRequestStatus.NOUVEAU,
      firstName: 'Abdou',
      lastName: 'Sarr',
      phone: '+221778889999',
      actorType: ActorType.PRODUCTEUR,
      locality: 'Ross Béthio',
      region: 'Saint-Louis',
      crop: 'Tomate',
      cropStage: 'Floraison',
      symptoms: 'Feuilles jaunies avec des petites mouches blanches qui s\'envolent quand je secoue les plants.',
      description: 'Le problème a commencé il y a 2 semaines sur une parcelle de 0,5 hectare. Les plants voisins commencent à être touchés.',
      consent: true,
    },
  });

  await prisma.partnershipRequest.create({
    data: {
      status: PartnershipStatus.NOUVEAU,
      partnerType: PartnerType.DISTRIBUTEUR,
      organizationName: 'Agri Distribution Sahel',
      contactName: 'Ousmane Dieng',
      phone: '+221776665544',
      email: 'o.dieng@agridist.sn',
      locality: 'Touba',
      region: 'Diourbel',
      proposal: 'Nous sommes un distributeur d\'intrants agricoles dans la zone Centre et nous souhaitons référencer les produits Sen Biopest dans notre catalogue.',
      objectives: 'Distribution des produits Sen Biopest dans les régions de Diourbel, Kaolack et Kaffrine.',
      consent: true,
    },
  });

  // Sample training registration
  await prisma.trainingRegistration.create({
    data: {
      trainingId: training1.id,
      firstName: 'Mariama',
      lastName: 'Seck',
      phone: '+221775554433',
      organization: 'Groupement Jàmm',
      actorType: ActorType.COOPERATIVE,
      locality: 'Mbour',
      region: 'Thiès',
      motivation: 'Former nos membres sur l\'utilisation correcte des biopesticides pour nos cultures de légumes.',
      consent: true,
      status: RegistrationStatus.CONFIRME,
    },
  });

  console.log('Sample data created');
  console.log('Seeding complete!');
  console.log('');
  console.log('Admin login: admin@senbiopest.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
