import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site Sen Biopest. Informations sur l\'éditeur, l\'hébergement et les conditions d\'utilisation.',
};

export default function MentionsLegalesPage() {
  return (
    <>
      <section className="section-padding bg-white">
        <div className="container-narrow">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Mentions légales</h1>

          <div className="prose prose-gray max-w-none space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Éditeur du site</h2>
              <p className="text-gray-600 leading-relaxed">
                Le site <strong>senbiopest.sn</strong> est édité par :<br />
                <strong>Sen Biopest</strong><br />
                Forme juridique : [A compléter]<br />
                Capital social : [A compléter]<br />
                Siège social : Dakar, Sénégal<br />
                NINEA : [A compléter]<br />
                RC : [A compléter]<br />
                Téléphone : +221 77 000 00 00<br />
                Email : contact@senbiopest.sn<br />
                Directeur de publication : [Nom du responsable]
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Hébergement</h2>
              <p className="text-gray-600 leading-relaxed">
                Le site est hébergé par :<br />
                [Nom de l'hébergeur]<br />
                Adresse : [Adresse de l'hébergeur]<br />
                Téléphone : [Téléphone de l'hébergeur]
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Propriété intellectuelle</h2>
              <p className="text-gray-600 leading-relaxed">
                L'ensemble du contenu de ce site (textes, images, vidéos, graphismes, logo, icônes, sons, logiciels, etc.) est la propriété exclusive de Sen Biopest ou de ses partenaires et est protégé par les lois sénégalaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable de Sen Biopest.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Limitation de responsabilité</h2>
              <p className="text-gray-600 leading-relaxed">
                Sen Biopest s'efforce de fournir sur le site des informations aussi précises que possible. Toutefois, elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Toutes les informations proposées sur le site sont données à titre indicatif et sont susceptibles d'évoluer. Par ailleurs, les renseignements figurant sur le site ne sont pas exhaustifs. Ils sont donnés sous réserve de modifications ayant été apportées depuis leur mise en ligne.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Liens hypertextes</h2>
              <p className="text-gray-600 leading-relaxed">
                Le site peut contenir des liens hypertextes vers d'autres sites internet. Sen Biopest n'exerce aucun contrôle sur le contenu de ces sites tiers et décline toute responsabilité quant à leur contenu ou aux dommages qui pourraient résulter de leur utilisation.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Droit applicable</h2>
              <p className="text-gray-600 leading-relaxed">
                Les présentes mentions légales sont soumises au droit sénégalais. En cas de litige, les tribunaux de Dakar seront seuls compétents.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:contact@senbiopest.sn" className="text-primary-600 hover:underline">contact@senbiopest.sn</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
