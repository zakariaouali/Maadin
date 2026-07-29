import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const url = `${SITE_URL}/${locale}/privacy`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en/privacy`,
        fr: `${SITE_URL}/fr/privacy`,
        ar: `${SITE_URL}/ar/privacy`,
      },
    },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), url, type: "website" },
  };
}

/* ─── Content per locale ─── */
const CONTENT: Record<string, { title: string; updated: string; intro: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: June 28, 2026",
    intro:
      "Marrakech Maadine ('we', 'our', 'the Platform') operates the online artisan marketplace accessible at this website. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our platform, in accordance with applicable Moroccan law (Law 09-08 on Personal Data Protection) and the General Data Protection Regulation (GDPR) where applicable.",
    sections: [
      {
        heading: "1. Data Controller",
        body: "The data controller responsible for your personal data is Marrakech Maadine, a marketplace platform registered in Morocco. For any privacy-related enquiries, please contact us at maadinemarrakech@gmail.com.",
      },
      {
        heading: "2. Data We Collect",
        body:
          "We collect the following categories of personal data:\n\n• **Account data**: name, email address, password (encrypted), role (buyer, seller, guest).\n• **Profile data**: avatar photo, phone number, address, and for sellers: store name, store description, bank account details (stored encrypted).\n• **Transaction data**: orders placed, order history, payment status, delivery addresses.\n• **Communication data**: messages exchanged between buyers and sellers on the platform, support ticket content.\n• **Technical data**: IP address, browser type, device identifiers, pages visited, session duration, cookies.\n• **Content data**: product listings, photos, descriptions, and reviews submitted by sellers and buyers.",
      },
      {
        heading: "3. How We Use Your Data",
        body:
          "We use your personal data for the following purposes:\n\n• To create and manage your account.\n• To process orders, payments, and deliveries.\n• To enable communication between buyers and sellers.\n• To provide customer and seller support.\n• To verify seller identity and store eligibility.\n• To send transactional emails (order confirmations, shipping updates, replies to support tickets).\n• To detect and prevent fraud, abuse, and policy violations.\n• To improve the platform through aggregated, anonymised analytics.\n• To comply with our legal obligations under Moroccan and applicable international law.",
      },
      {
        heading: "4. Legal Basis for Processing",
        body:
          "We process your data on the following legal bases:\n\n• **Contract performance**: processing necessary to fulfil your order or operate your seller account.\n• **Legitimate interest**: fraud prevention, platform security, and service improvement.\n• **Legal obligation**: compliance with Moroccan financial regulations, tax law, and court orders.\n• **Consent**: marketing communications (you may withdraw consent at any time).",
      },
      {
        heading: "5. Data Sharing",
        body:
          "We do not sell your personal data. We may share it with:\n\n• **Payment processors**: to securely handle transactions.\n• **Logistics partners**: delivery name and address shared with shipping providers when necessary.\n• **Hosting and infrastructure providers**: operating our servers and databases under strict data processing agreements.\n• **Legal authorities**: when required by Moroccan law, court order, or regulatory request.\n\nAll third parties are contractually bound to process your data only for the stated purpose and under appropriate security measures.",
      },
      {
        heading: "6. Data Retention",
        body:
          "We retain your personal data for as long as your account is active or as necessary to provide our services. After account deletion:\n\n• Order and transaction records are retained for 10 years as required by Moroccan tax and commercial law.\n• Support tickets are retained for 3 years.\n• Chat messages are deleted within 90 days of account closure.\n• Technical logs are retained for 12 months.",
      },
      {
        heading: "7. Your Rights",
        body:
          "Under Law 09-08 and GDPR (where applicable), you have the right to:\n\n• **Access**: request a copy of the personal data we hold about you.\n• **Rectification**: correct inaccurate or incomplete data.\n• **Erasure**: request deletion of your data, subject to legal retention obligations.\n• **Portability**: receive your data in a structured, machine-readable format.\n• **Restriction**: request we limit how we process your data in certain circumstances.\n• **Objection**: object to processing based on legitimate interests.\n• **Withdraw consent**: for any processing based on consent, at any time.\n\nTo exercise any right, contact us at maadinemarrakech@gmail.com. We will respond within 30 days.",
      },
      {
        heading: "8. Cookies",
        body:
          "We use the following cookies:\n\n• **Strictly necessary**: session authentication cookies (HTTP-only, secure). Cannot be disabled.\n• **Functional**: language and currency preferences.\n• **Analytics**: anonymised usage statistics to improve the platform (opt-out available in your account settings).\n\nYou can manage cookie preferences through your browser settings. Disabling strictly necessary cookies will prevent you from logging in.",
      },
      {
        heading: "9. Security",
        body:
          "We implement industry-standard security measures including HTTPS/TLS encryption for all data in transit, bcrypt password hashing, HTTP-only authentication cookies, access controls limiting staff access to personal data, and regular security audits. Despite these measures, no system is completely secure. We encourage you to use a strong, unique password and to contact us immediately at maadinemarrakech@gmail.com if you suspect unauthorised access.",
      },
      {
        heading: "10. International Transfers",
        body:
          "Our infrastructure is hosted in the European Union. If your data is transferred outside Morocco or the EEA, we ensure appropriate safeguards are in place (Standard Contractual Clauses or equivalent mechanisms) in compliance with Moroccan CNDP guidelines.",
      },
      {
        heading: "11. Changes to This Policy",
        body:
          "We may update this Privacy Policy from time to time. We will notify registered users by email and post a notice on the platform at least 14 days before changes take effect. Continued use of the platform after that date constitutes acceptance of the updated policy.",
      },
      {
        heading: "12. Contact & Complaints",
        body:
          "For any privacy questions, contact us at maadinemarrakech@gmail.com.\n\nIf you believe we have not handled your data appropriately, you have the right to lodge a complaint with the Moroccan Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel (CNDP) at www.cndp.ma.",
      },
    ],
  },

  fr: {
    title: "Politique de Confidentialité",
    updated: "Dernière mise à jour : 28 juin 2026",
    intro:
      "Marrakech Maadine (« nous », « notre », « la Plateforme ») exploite la marketplace artisanale en ligne accessible sur ce site. La présente Politique de Confidentialité explique comment nous collectons, utilisons, conservons et protégeons vos données personnelles lorsque vous utilisez notre plateforme, conformément à la loi marocaine 09-08 relative à la protection des données à caractère personnel et, le cas échéant, au Règlement Général sur la Protection des Données (RGPD).",
    sections: [
      {
        heading: "1. Responsable du Traitement",
        body: "Le responsable du traitement de vos données personnelles est Marrakech Maadine, une plateforme marketplace enregistrée au Maroc. Pour toute question relative à la confidentialité, contactez-nous à l'adresse maadinemarrakech@gmail.com.",
      },
      {
        heading: "2. Données Collectées",
        body:
          "Nous collectons les catégories de données personnelles suivantes :\n\n• **Données de compte** : nom, adresse e-mail, mot de passe (chiffré), rôle (acheteur, vendeur, invité).\n• **Données de profil** : photo de profil, numéro de téléphone, adresse, et pour les vendeurs : nom du magasin, description, coordonnées bancaires (stockées chiffrées).\n• **Données transactionnelles** : commandes passées, historique des commandes, statut de paiement, adresses de livraison.\n• **Données de communication** : messages échangés entre acheteurs et vendeurs, contenu des tickets de support.\n• **Données techniques** : adresse IP, type de navigateur, identifiants d'appareil, pages visitées, durée de session, cookies.\n• **Données de contenu** : fiches produits, photos, descriptions et avis publiés par les vendeurs et acheteurs.",
      },
      {
        heading: "3. Utilisation de Vos Données",
        body:
          "Nous utilisons vos données personnelles aux fins suivantes :\n\n• Créer et gérer votre compte.\n• Traiter les commandes, paiements et livraisons.\n• Permettre la communication entre acheteurs et vendeurs.\n• Fournir le support client et vendeur.\n• Vérifier l'identité des vendeurs et l'éligibilité des boutiques.\n• Envoyer des e-mails transactionnels (confirmations de commande, mises à jour d'expédition, réponses aux tickets).\n• Détecter et prévenir les fraudes, abus et violations de nos règles.\n• Améliorer la plateforme via des analyses agrégées et anonymisées.\n• Respecter nos obligations légales en droit marocain et international applicable.",
      },
      {
        heading: "4. Base Légale du Traitement",
        body:
          "Nous traitons vos données sur les bases légales suivantes :\n\n• **Exécution du contrat** : traitement nécessaire à l'exécution de votre commande ou à la gestion de votre compte vendeur.\n• **Intérêt légitime** : prévention de la fraude, sécurité de la plateforme, amélioration des services.\n• **Obligation légale** : conformité aux réglementations financières marocaines, droit fiscal et décisions judiciaires.\n• **Consentement** : communications marketing (révocable à tout moment).",
      },
      {
        heading: "5. Partage des Données",
        body:
          "Nous ne vendons pas vos données personnelles. Nous pouvons les partager avec :\n\n• **Prestataires de paiement** : pour sécuriser les transactions.\n• **Partenaires logistiques** : nom et adresse de livraison partagés avec les transporteurs si nécessaire.\n• **Fournisseurs d'hébergement** : exploitation de nos serveurs et bases de données sous des accords de traitement stricts.\n• **Autorités légales** : sur demande de la loi marocaine, d'une décision judiciaire ou d'une autorité réglementaire.\n\nTous les tiers sont contractuellement tenus de traiter vos données uniquement aux fins déclarées et sous des mesures de sécurité appropriées.",
      },
      {
        heading: "6. Durée de Conservation",
        body:
          "Nous conservons vos données personnelles aussi longtemps que votre compte est actif ou que nécessaire pour nos services. Après suppression du compte :\n\n• Les dossiers de commandes et transactions sont conservés 10 ans (droit fiscal et commercial marocain).\n• Les tickets de support sont conservés 3 ans.\n• Les messages de chat sont supprimés dans les 90 jours suivant la fermeture du compte.\n• Les journaux techniques sont conservés 12 mois.",
      },
      {
        heading: "7. Vos Droits",
        body:
          "En vertu de la loi 09-08 et du RGPD (le cas échéant), vous disposez des droits suivants :\n\n• **Accès** : obtenir une copie des données personnelles que nous détenons vous concernant.\n• **Rectification** : corriger des données inexactes ou incomplètes.\n• **Effacement** : demander la suppression de vos données, sous réserve des obligations légales de conservation.\n• **Portabilité** : recevoir vos données dans un format structuré et lisible par machine.\n• **Limitation** : demander la limitation du traitement dans certaines circonstances.\n• **Opposition** : vous opposer aux traitements fondés sur l'intérêt légitime.\n• **Retrait du consentement** : à tout moment pour les traitements fondés sur le consentement.\n\nPour exercer un droit, contactez-nous à maadinemarrakech@gmail.com. Nous répondrons dans un délai de 30 jours.",
      },
      {
        heading: "8. Cookies",
        body:
          "Nous utilisons les cookies suivants :\n\n• **Strictement nécessaires** : cookies d'authentification de session (HTTP-only, sécurisés). Non désactivables.\n• **Fonctionnels** : préférences de langue et de devise.\n• **Analytiques** : statistiques d'utilisation anonymisées pour améliorer la plateforme (opt-out disponible dans les paramètres du compte).\n\nVous pouvez gérer vos préférences via les paramètres de votre navigateur. La désactivation des cookies strictement nécessaires empêchera la connexion.",
      },
      {
        heading: "9. Sécurité",
        body:
          "Nous appliquons des mesures de sécurité standard : chiffrement HTTPS/TLS pour toutes les données en transit, hachage bcrypt des mots de passe, cookies d'authentification HTTP-only, contrôles d'accès limitant l'accès du personnel aux données personnelles, et audits de sécurité réguliers. Malgré ces mesures, aucun système n'est infaillible. Utilisez un mot de passe fort et unique, et contactez-nous immédiatement à maadinemarrakech@gmail.com en cas d'accès non autorisé suspecté.",
      },
      {
        heading: "10. Transferts Internationaux",
        body:
          "Notre infrastructure est hébergée dans l'Union Européenne. En cas de transfert de vos données hors du Maroc ou de l'EEE, nous nous assurons de la mise en place de garanties appropriées (Clauses Contractuelles Types ou mécanismes équivalents) conformément aux recommandations de la CNDP marocaine.",
      },
      {
        heading: "11. Modifications de Cette Politique",
        body:
          "Nous pouvons mettre à jour cette Politique de Confidentialité périodiquement. Nous notifierons les utilisateurs enregistrés par e-mail et afficherons un avis sur la plateforme au moins 14 jours avant l'entrée en vigueur des modifications. L'utilisation continue de la plateforme après cette date vaut acceptation de la politique mise à jour.",
      },
      {
        heading: "12. Contact & Réclamations",
        body:
          "Pour toute question relative à la confidentialité, contactez-nous à maadinemarrakech@gmail.com.\n\nSi vous estimez que nous n'avons pas traité vos données de manière appropriée, vous avez le droit de déposer une plainte auprès de la Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel (CNDP) sur www.cndp.ma.",
      },
    ],
  },

  ar: {
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: 28 يونيو 2026",
    intro:
      "تشغّل مراكش معادن («نحن» أو «المنصة») سوقاً إلكترونياً للحرف اليدوية يمكن الوصول إليه عبر هذا الموقع. توضّح سياسة الخصوصية هذه كيفية جمع بياناتكم الشخصية واستخدامها وتخزينها وحمايتها عند استخدام منصتنا، وفقاً للقانون المغربي 09-08 المتعلق بحماية المعطيات ذات الطابع الشخصي، وللائحة الأوروبية العامة لحماية البيانات (GDPR) حيثما ينطبق ذلك.",
    sections: [
      {
        heading: "١. المتحكم في البيانات",
        body: "المتحكم في معالجة بياناتكم الشخصية هو مراكش معادن، منصة سوق إلكتروني مسجّلة في المغرب. لأي استفسارات تتعلق بالخصوصية، يُرجى التواصل معنا على: maadinemarrakech@gmail.com.",
      },
      {
        heading: "٢. البيانات التي نجمعها",
        body:
          "نجمع الفئات التالية من البيانات الشخصية:\n\n• **بيانات الحساب**: الاسم، عنوان البريد الإلكتروني، كلمة المرور (مشفّرة)، الدور (مشترٍ، بائع، زائر).\n• **بيانات الملف الشخصي**: صورة الملف، رقم الهاتف، العنوان، وللبائعين: اسم المتجر، الوصف، بيانات الحساب البنكي (مخزّنة مشفّرة).\n• **البيانات التعاملية**: الطلبات المُقدَّمة، سجل الطلبات، حالة الدفع، عناوين التسليم.\n• **بيانات التواصل**: الرسائل المتبادلة بين المشترين والبائعين، محتوى تذاكر الدعم.\n• **البيانات التقنية**: عنوان IP، نوع المتصفح، معرّفات الأجهزة، الصفحات المزارة، مدة الجلسة، ملفات تعريف الارتباط.\n• **بيانات المحتوى**: قوائم المنتجات والصور والأوصاف والتقييمات المنشورة من البائعين والمشترين.",
      },
      {
        heading: "٣. كيفية استخدام بياناتكم",
        body:
          "نستخدم بياناتكم الشخصية للأغراض التالية:\n\n• إنشاء حسابكم وإدارته.\n• معالجة الطلبات والمدفوعات والتوصيل.\n• تمكين التواصل بين المشترين والبائعين.\n• تقديم دعم العملاء والبائعين.\n• التحقق من هوية البائعين وأهلية المتاجر.\n• إرسال رسائل بريد إلكتروني تعاملية (تأكيد الطلبات، تحديثات الشحن، ردود تذاكر الدعم).\n• اكتشاف الاحتيال والإساءة والمخالفات ومنعها.\n• تحسين المنصة من خلال تحليلات مجمّعة ومجهولة الهوية.\n• الامتثال لالتزاماتنا القانونية بموجب القانون المغربي والدولي المطبّق.",
      },
      {
        heading: "٤. الأساس القانوني للمعالجة",
        body:
          "نعالج بياناتكم استناداً إلى الأسس القانونية التالية:\n\n• **تنفيذ العقد**: المعالجة اللازمة لتنفيذ طلبكم أو تشغيل حساب البائع.\n• **المصلحة المشروعة**: منع الاحتيال، أمن المنصة، تحسين الخدمة.\n• **الالتزام القانوني**: الامتثال للوائح المالية المغربية والقانون الضريبي والقرارات القضائية.\n• **الموافقة**: الاتصالات التسويقية (يمكن سحبها في أي وقت).",
      },
      {
        heading: "٥. مشاركة البيانات",
        body:
          "لا نبيع بياناتكم الشخصية. قد نشاركها مع:\n\n• **معالجي الدفع**: لتأمين المعاملات.\n• **شركاء الخدمات اللوجستية**: اسم التسليم والعنوان يُشاركان مع مزودي الشحن عند الضرورة.\n• **مزودي الاستضافة والبنية التحتية**: تشغيل خوادمنا وقواعد البيانات بموجب اتفاقيات معالجة صارمة.\n• **السلطات القانونية**: عند الاقتضاء بموجب القانون المغربي أو قرار قضائي.\n\nجميع الأطراف الثالثة ملزَمة تعاقدياً بمعالجة بياناتكم فقط للغرض المحدد وبموجب تدابير أمنية مناسبة.",
      },
      {
        heading: "٦. مدة الاحتفاظ بالبيانات",
        body:
          "نحتفظ ببياناتكم الشخصية طالما حسابكم نشط أو بالقدر اللازم لتقديم خدماتنا. بعد حذف الحساب:\n\n• تُحتفظ سجلات الطلبات والمعاملات لمدة 10 سنوات (القانون الضريبي والتجاري المغربي).\n• تُحتفظ تذاكر الدعم لمدة 3 سنوات.\n• تُحذف رسائل الدردشة خلال 90 يوماً من إغلاق الحساب.\n• تُحتفظ السجلات التقنية لمدة 12 شهراً.",
      },
      {
        heading: "٧. حقوقكم",
        body:
          "بموجب القانون 09-08 والـ GDPR (حيثما ينطبق)، تتمتعون بالحقوق التالية:\n\n• **الوصول**: طلب نسخة من بياناتكم الشخصية التي نحتفظ بها.\n• **التصحيح**: تصحيح البيانات غير الدقيقة أو غير المكتملة.\n• **المحو**: طلب حذف بياناتكم مع مراعاة الالتزامات القانونية للاحتفاظ بها.\n• **قابلية النقل**: استلام بياناتكم بصيغة منظّمة وقابلة للقراءة آلياً.\n• **التقييد**: طلب تقييد المعالجة في ظروف معينة.\n• **الاعتراض**: الاعتراض على المعالجة المستندة إلى المصلحة المشروعة.\n• **سحب الموافقة**: في أي وقت لأي معالجة تستند إلى موافقتكم.\n\nللاستفادة من أي حق، تواصلوا معنا على maadinemarrakech@gmail.com. سنردّ في غضون 30 يوماً.",
      },
      {
        heading: "٨. ملفات تعريف الارتباط (الكوكيز)",
        body:
          "نستخدم ملفات تعريف الارتباط التالية:\n\n• **ضرورية بالكامل**: كوكيز مصادقة الجلسة (HTTP-only، آمنة). لا يمكن تعطيلها.\n• **وظيفية**: تفضيلات اللغة والعملة.\n• **تحليلية**: إحصاءات استخدام مجهولة الهوية لتحسين المنصة (يمكن إلغاء الاشتراك في إعدادات الحساب).\n\nيمكنكم إدارة تفضيلاتكم عبر إعدادات المتصفح. تعطيل ملفات تعريف الارتباط الضرورية بالكامل سيمنع تسجيل الدخول.",
      },
      {
        heading: "٩. الأمن",
        body:
          "نطبّق معايير أمان صناعية: تشفير HTTPS/TLS لجميع البيانات أثناء النقل، تجزئة كلمات المرور بخوارزمية bcrypt، كوكيز مصادقة HTTP-only، ضوابط وصول تحدّ من اطّلاع الموظفين على البيانات الشخصية، وعمليات تدقيق أمني دورية. بالرغم من هذه التدابير، لا يوجد نظام محصّن بالكامل. نشجّعكم على استخدام كلمة مرور قوية وفريدة، والتواصل معنا فوراً على maadinemarrakech@gmail.com إذا اشتبهتم في وصول غير مصرّح.",
      },
      {
        heading: "١٠. النقل الدولي للبيانات",
        body:
          "تُستضاف بنيتنا التحتية في الاتحاد الأوروبي. في حال نُقلت بياناتكم خارج المغرب أو المنطقة الاقتصادية الأوروبية، نضمن وجود ضمانات مناسبة (البنود التعاقدية القياسية أو آليات مكافئة) وفقاً لإرشادات اللجنة الوطنية لمراقبة حماية المعطيات الشخصية (CNDP).",
      },
      {
        heading: "١١. التغييرات على هذه السياسة",
        body:
          "قد نحدّث هذه السياسة من وقت لآخر. سنخطر المستخدمين المسجّلين عبر البريد الإلكتروني وننشر إشعاراً على المنصة قبل 14 يوماً على الأقل من دخول التعديلات حيّز التنفيذ. الاستمرار في استخدام المنصة بعد ذلك التاريخ يُعدّ قبولاً للسياسة المحدّثة.",
      },
      {
        heading: "١٢. التواصل والشكاوى",
        body:
          "لأي استفسارات تتعلق بالخصوصية، تواصلوا معنا على: maadinemarrakech@gmail.com.\n\nإذا رأيتم أننا لم نتعامل مع بياناتكم بالشكل المناسب، يحق لكم تقديم شكوى لدى اللجنة الوطنية لمراقبة حماية المعطيات الشخصية (CNDP) على الموقع: www.cndp.ma.",
      },
    ],
  },
};

function renderBody(body: string) {
  return body.split("\n\n").map((para, i) => {
    if (para.startsWith("•")) {
      const items = para.split("\n").filter(Boolean);
      return (
        <ul key={i} className="space-y-2 my-4">
          {items.map((item, j) => {
            const clean = item.replace(/^•\s*/, "");
            const parts = clean.split(/\*\*(.*?)\*\*/g);
            return (
              <li key={j} className="flex gap-2 text-[#4a4440] text-sm leading-relaxed">
                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#c9a96e] shrink-0" />
                <span>
                  {parts.map((p, k) =>
                    k % 2 === 1 ? <strong key={k} className="text-[#1f1b16] font-semibold">{p}</strong> : p
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      );
    }
    return (
      <p key={i} className="text-[#4a4440] text-sm leading-relaxed mb-3">
        {para}
      </p>
    );
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = CONTENT[locale] ?? CONTENT.en;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Hero */}
      <div className="bg-[#1f1b16] text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a96e] mb-3">Marrakech Maadine</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-3">{content.title}</h1>
          <p className="text-white/40 text-sm">{content.updated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-14">
        {/* Intro */}
        <p className="text-[#4a4440] text-sm leading-relaxed mb-10 p-5 bg-white rounded-2xl border border-stone/10 shadow-sm">
          {content.intro}
        </p>

        {/* Sections */}
        <div className="space-y-10">
          {content.sections.map((section) => (
            <section key={section.heading} className="bg-white rounded-2xl border border-stone/10 shadow-sm p-6 sm:p-8">
              <h2 className="font-display text-lg text-[#1f1b16] mb-4 pb-3 border-b border-stone/10">
                {section.heading}
              </h2>
              {renderBody(section.body)}
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-[#8b8378]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {locale === "ar" ? "هذه الوثيقة ملزمة قانونياً وتُشكّل جزءاً من شروط استخدام منصة مراكش معادن." : locale === "fr" ? "Ce document est juridiquement contraignant et fait partie des conditions d'utilisation de Marrakech Maadine." : "This document is legally binding and forms part of the Marrakech Maadine Terms of Service."}
          </div>
        </div>
      </div>
    </div>
  );
}
