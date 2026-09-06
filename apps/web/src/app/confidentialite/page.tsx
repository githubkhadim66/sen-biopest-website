import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité de Sen Biopest. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles.',
};

export default function ConfidentialitePage() {
  return (
    <>
      <section className="section-padding bg-white">
        <div className="container-narrow">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            Politique de confidentialité
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Chez Sen Biopest, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre site web et nos services.
          </p>

          <div className="prose prose-gray max-w-none space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. Données collectées
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Nous collectons les données suivantes lorsque vous utilisez notre site :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>
                  <strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone (fournies via nos formulaires)
                </li>
                <li>
                  <strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées, durée de visite (collectées automatiquement)
                </li>
                <li>
                  <strong>Données de communication :</strong> contenu des messages envoyés via le formulaire de contact ou WhatsApp
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. Finalité du traitement
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Vos données sont collectées pour les finalités suivantes :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Répondre à vos demandes de contact et de devis</li>
                <li>Vous inscrire à nos formations et sessions</li>
                <li>Assurer le suivi de votre accompagnement technique</li>
                <li>Vous envoyer des informations sur nos produits et services (avec votre consentement)</li>
                <li>Améliorer notre site web et nos services</li>
                <li>Etablir des statistiques de fréquentation anonymes</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. Base juridique
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Le traitement de vos données repose sur :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Votre consentement explicite (formulaire de contact, inscription)</li>
                <li>L'exécution d'un contrat ou de mesures précontractuelles (demande de devis)</li>
                <li>Notre intérêt légitime (amélioration de nos services, statistiques)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Destinataires des données
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Vos données personnelles sont destinées uniquement au personnel habilité de Sen Biopest. Elles ne sont en aucun cas vendues ou cédées à des tiers à des fins commerciales. Elles peuvent être transmises à nos sous-traitants techniques (hébergement, envoi d'emails) dans le cadre strict de l'exécution de nos services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Durée de conservation
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Vos données sont conservées pendant la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Données de contact : 3 ans après le dernier échange</li>
                <li>Données clients : durée de la relation commerciale + 5 ans</li>
                <li>Données de navigation : 13 mois</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Vos droits
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Conformément à la loi sénégalaise n 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li><strong>Droit d'accès :</strong> obtenir la confirmation que vos données sont traitées et en recevoir une copie</li>
                <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
                <li><strong>Droit de suppression :</strong> demander l'effacement de vos données</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                <li><strong>Droit de limitation :</strong> demander la limitation du traitement</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@senbiopest.sn" className="text-primary-600 hover:underline">contact@senbiopest.sn</a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. Sécurité
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Nous mettons en oeuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Nos systèmes sont régulièrement mis à jour et audités.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. Cookies
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Notre site utilise des cookies techniques nécessaires à son bon fonctionnement. Des cookies de mesure d'audience peuvent également être utilisés avec votre consentement. Vous pouvez configurer votre navigateur pour refuser les cookies.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. Modifications
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Sen Biopest se réserve le droit de modifier la présente politique de confidentialité à tout moment. Les modifications prennent effet dès leur publication sur le site. Nous vous encourageons à consulter régulièrement cette page.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                10. Contact
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Pour toute question relative à cette politique de confidentialité ou à la protection de vos données, contactez-nous :
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Sen Biopest</strong><br />
                Email : <a href="mailto:contact@senbiopest.sn" className="text-primary-600 hover:underline">contact@senbiopest.sn</a><br />
                Téléphone : +221 77 000 00 00<br />
                Adresse : Dakar, Sénégal
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-400 mt-12">
            Dernière mise à jour : mars 2026
          </p>
        </div>
      </section>
    </>
  );
}
