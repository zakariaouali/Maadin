import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  const url = `${SITE_URL}/${locale}/terms`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en/terms`,
        fr: `${SITE_URL}/fr/terms`,
        ar: `${SITE_URL}/ar/terms`,
      },
    },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), url, type: "website" },
  };
}

const CONTENT: Record<string, { title: string; updated: string; intro: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: "Terms of Service",
    updated: "Last updated: June 28, 2026",
    intro:
      "These Terms of Service ('Terms') govern your access to and use of the Marrakech Maadine platform ('Platform'), operated by Marrakech Maadine ('we', 'us'). By creating an account, placing an order, or listing a product, you agree to these Terms in full. If you do not agree, you must not use the Platform.",
    sections: [
      {
        heading: "1. Definitions",
        body:
          "• **Platform**: the Marrakech Maadine website and all associated services.\n• **User**: any person accessing the Platform, whether registered or as a guest.\n• **Buyer**: a User who purchases products through the Platform.\n• **Seller**: a User who lists and sells products through the Platform.\n• **Admin**: a Platform employee or authorised representative.\n• **Listing**: a product or service offered for sale on the Platform.\n• **Order**: a confirmed purchase transaction between a Buyer and a Seller facilitated by the Platform.",
      },
      {
        heading: "2. Eligibility",
        body:
          "You must be at least 18 years of age to create an account or make a purchase. By using the Platform, you confirm that you meet this requirement. The Platform is open to users worldwide, though some features may be restricted based on your location.\n\nSellers must hold the legal right to sell the products they list, whether as the original creator, an authorised reseller, or a licensed trader under Moroccan commercial law.",
      },
      {
        heading: "3. Account Registration",
        body:
          "To access full platform functionality, you must register an account. You agree to:\n\n• Provide accurate, current, and complete information during registration.\n• Keep your login credentials confidential and not share them with third parties.\n• Notify us immediately at maadinemarrakech@gmail.com if you suspect unauthorised access to your account.\n• Be solely responsible for all activity that occurs under your account.\n\nWe reserve the right to suspend or terminate accounts that provide false information or violate these Terms.",
      },
      {
        heading: "4. Seller Accounts & Subscriptions",
        body:
          "Sellers must apply for a seller account and be approved by the Platform. Approval is at our sole discretion and we may decline applications without providing a reason.\n\nSeller accounts are offered under subscription plans ('Starter', 'Managed', 'Premium'). By subscribing:\n\n• You authorise us to charge the subscription fee on the agreed billing cycle.\n• Subscriptions renew automatically unless cancelled before the renewal date.\n• No refunds are issued for partial subscription periods.\n• We reserve the right to modify subscription pricing with 30 days' notice.\n\nSellers who do not renew their subscription will lose access to seller features; their listings will be suspended until the subscription is restored.",
      },
      {
        heading: "5. Listings & Prohibited Content",
        body:
          "Sellers are responsible for the accuracy, legality, and completeness of their listings. You must not list:\n\n• Counterfeit, fake, or misrepresented goods.\n• Items that infringe third-party intellectual property rights.\n• Prohibited or regulated items (weapons, controlled substances, live animals).\n• Products that violate Moroccan law or international sanctions.\n• Items not related to artisan craft (the Platform is dedicated exclusively to authentic handmade goods).\n\nAll listings are subject to admin review. We may remove any listing at our discretion without prior notice. Repeated violations will result in permanent account suspension.",
      },
      {
        heading: "6. Orders & Payments",
        body:
          "When a Buyer places an order, a binding contract is formed between the Buyer and the Seller. The Platform acts as the intermediary facilitating the transaction.\n\n• Prices are displayed in Moroccan Dirhams (MAD) unless otherwise indicated.\n• Payment is processed at the time of order confirmation.\n• The Platform charges a service fee on each transaction; the current fee structure is published in your seller dashboard.\n• Orders may be cancelled within 24 hours of placement if the Seller has not yet shipped the item.\n• Sellers are responsible for accurate shipping estimates and timely fulfilment.",
      },
      {
        heading: "7. Returns & Refunds",
        body:
          "Buyers may request a return within 14 days of receiving an order if:\n\n• The item received is significantly different from its description.\n• The item arrives damaged or defective.\n• The wrong item was shipped.\n\nCustom-made or personalised items are non-refundable unless they arrive damaged or defective.\n\nReturn shipping costs are borne by the Seller when the return is due to Seller error, or by the Buyer in other cases. Refunds are processed within 7 business days of the Platform receiving confirmation of the return.",
      },
      {
        heading: "8. Intellectual Property",
        body:
          "All content on the Platform — including the Marrakech Maadine name, logo, design, software, and editorial content — is the property of Marrakech Maadine and protected by Moroccan and international intellectual property law.\n\nSellers retain ownership of the content they upload (product photos, descriptions). By uploading content, you grant Marrakech Maadine a non-exclusive, royalty-free licence to display, reproduce, and promote that content for the purpose of operating and marketing the Platform.\n\nYou must not scrape, copy, or reproduce Platform content without our written permission.",
      },
      {
        heading: "9. Prohibited Conduct",
        body:
          "You must not:\n\n• Attempt to circumvent the Platform's payment system by transacting directly with other users.\n• Post false reviews or manipulate the ratings system.\n• Use the Platform to send spam, harass other users, or distribute malware.\n• Attempt to hack, reverse-engineer, or disrupt the Platform's infrastructure.\n• Create multiple accounts to evade a suspension or ban.\n• Impersonate another user, seller, or Platform representative.\n\nViolations may result in immediate account termination and may be referred to Moroccan law enforcement authorities.",
      },
      {
        heading: "10. Limitation of Liability",
        body:
          "The Platform acts as an intermediary marketplace and does not manufacture, inspect, or guarantee the quality of products sold by Sellers. To the maximum extent permitted by applicable law:\n\n• We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.\n• Our total liability in connection with any claim is limited to the amount you paid for the transaction giving rise to the claim.\n• We make no warranty that the Platform will be available without interruption, error-free, or free from viruses.\n\nNothing in these Terms limits liability for fraud, death, or personal injury caused by our negligence.",
      },
      {
        heading: "11. Dispute Resolution",
        body:
          "If a dispute arises between a Buyer and a Seller, both parties agree to first attempt resolution through the Platform's mediation process (accessible via the support centre).\n\nIf mediation fails, disputes will be submitted to the competent courts of Marrakech, Morocco, unless applicable consumer protection law requires otherwise.\n\nFor disputes between Users and the Platform itself, Moroccan law applies exclusively.",
      },
      {
        heading: "12. Termination",
        body:
          "You may close your account at any time from your profile settings. We may suspend or terminate your account at any time for:\n\n• Breach of these Terms.\n• Fraudulent activity.\n• Failure to pay outstanding amounts.\n• Inactivity exceeding 24 months (with prior notice).\n\nUpon termination, your access to seller or buyer features will cease immediately. Outstanding orders will be processed to completion. Data retention is governed by our Privacy Policy.",
      },
      {
        heading: "13. Amendments",
        body:
          "We reserve the right to modify these Terms at any time. We will notify registered users by email and post a notice on the Platform at least 14 days before changes take effect. Continued use of the Platform after that date constitutes acceptance of the revised Terms.",
      },
      {
        heading: "14. Governing Law",
        body:
          "These Terms are governed by the laws of the Kingdom of Morocco. Any dispute not resolved through mediation will be subject to the exclusive jurisdiction of the competent courts of Marrakech.",
      },
      {
        heading: "15. Contact",
        body:
          "For any questions about these Terms, contact us at maadinemarrakech@gmail.com or write to Marrakech Maadine, Médina, Marrakech, Morocco.",
      },
    ],
  },

  fr: {
    title: "Conditions Générales d'Utilisation",
    updated: "Dernière mise à jour : 28 juin 2026",
    intro:
      "Les présentes Conditions Générales d'Utilisation (« CGU ») régissent votre accès et votre utilisation de la plateforme Marrakech Maadine (« Plateforme »), exploitée par Marrakech Maadine (« nous »). En créant un compte, en passant une commande ou en publiant un produit, vous acceptez pleinement ces CGU. Si vous ne les acceptez pas, vous ne devez pas utiliser la Plateforme.",
    sections: [
      {
        heading: "1. Définitions",
        body:
          "• **Plateforme** : le site web Marrakech Maadine et tous les services associés.\n• **Utilisateur** : toute personne accédant à la Plateforme, qu'elle soit inscrite ou en tant qu'invité.\n• **Acheteur** : un Utilisateur qui achète des produits via la Plateforme.\n• **Vendeur** : un Utilisateur qui propose et vend des produits via la Plateforme.\n• **Administrateur** : un employé ou représentant autorisé de la Plateforme.\n• **Annonce** : un produit ou service proposé à la vente sur la Plateforme.\n• **Commande** : une transaction d'achat confirmée entre un Acheteur et un Vendeur facilitée par la Plateforme.",
      },
      {
        heading: "2. Conditions d'Accès",
        body:
          "Vous devez avoir au moins 18 ans pour créer un compte ou effectuer un achat. En utilisant la Plateforme, vous confirmez remplir cette condition. La Plateforme est accessible aux utilisateurs du monde entier, bien que certaines fonctionnalités puissent être limitées selon votre localisation.\n\nLes Vendeurs doivent détenir le droit légal de vendre les produits qu'ils proposent, en tant que créateur original, revendeur autorisé ou commerçant agréé selon le droit commercial marocain.",
      },
      {
        heading: "3. Inscription et Compte",
        body:
          "Pour accéder à toutes les fonctionnalités, vous devez créer un compte. Vous acceptez de :\n\n• Fournir des informations exactes, à jour et complètes lors de l'inscription.\n• Maintenir la confidentialité de vos identifiants de connexion et ne pas les partager avec des tiers.\n• Nous informer immédiatement à maadinemarrakech@gmail.com en cas d'accès non autorisé à votre compte.\n• Être seul responsable de toutes les activités réalisées depuis votre compte.\n\nNous nous réservons le droit de suspendre ou résilier les comptes fournissant des informations inexactes ou violant ces CGU.",
      },
      {
        heading: "4. Comptes Vendeur & Abonnements",
        body:
          "Les vendeurs doivent soumettre une demande et être approuvés par la Plateforme. L'approbation est à notre seule discrétion.\n\nLes comptes Vendeur sont proposés sous des formules d'abonnement (« Starter », « Managed », « Premium »). En souscrivant :\n\n• Vous nous autorisez à prélever les frais d'abonnement selon le cycle de facturation convenu.\n• Les abonnements se renouvellent automatiquement sauf résiliation avant la date de renouvellement.\n• Aucun remboursement n'est accordé pour les périodes d'abonnement partielles.\n• Nous nous réservons le droit de modifier les tarifs avec un préavis de 30 jours.\n\nLes Vendeurs n'ayant pas renouvelé leur abonnement perdront l'accès aux fonctionnalités vendeur ; leurs annonces seront suspendues jusqu'à la restauration de l'abonnement.",
      },
      {
        heading: "5. Annonces & Contenu Interdit",
        body:
          "Les Vendeurs sont responsables de l'exactitude, de la légalité et de l'exhaustivité de leurs annonces. Il est interdit de proposer :\n\n• Des produits contrefaits, faux ou mal représentés.\n• Des articles portant atteinte aux droits de propriété intellectuelle de tiers.\n• Des articles interdits ou réglementés (armes, substances contrôlées, animaux vivants).\n• Des produits enfreignant la loi marocaine ou les sanctions internationales.\n• Des articles sans lien avec l'artisanat (la Plateforme est dédiée exclusivement aux articles faits main authentiques).\n\nToutes les annonces sont soumises à la vérification de l'administrateur. Nous pouvons supprimer toute annonce à notre discrétion. Des violations répétées entraîneront une suspension définitive du compte.",
      },
      {
        heading: "6. Commandes & Paiements",
        body:
          "Lors de la passation d'une commande, un contrat contraignant se forme entre l'Acheteur et le Vendeur. La Plateforme agit en tant qu'intermédiaire facilitant la transaction.\n\n• Les prix sont affichés en Dirhams marocains (MAD) sauf indication contraire.\n• Le paiement est traité lors de la confirmation de la commande.\n• La Plateforme prélève des frais de service sur chaque transaction ; le barème actuel est publié dans le tableau de bord vendeur.\n• Les commandes peuvent être annulées dans les 24 heures si le Vendeur n'a pas encore expédié l'article.\n• Les Vendeurs sont responsables des estimations de livraison et de l'exécution en temps voulu.",
      },
      {
        heading: "7. Retours & Remboursements",
        body:
          "Les Acheteurs peuvent demander un retour dans les 14 jours suivant la réception si :\n\n• L'article reçu est sensiblement différent de sa description.\n• L'article arrive endommagé ou défectueux.\n• Le mauvais article a été expédié.\n\nLes articles personnalisés ou sur mesure ne sont pas remboursables sauf en cas de dommage ou défaut à la réception.\n\nLes frais de retour sont à la charge du Vendeur si le retour est dû à son erreur, ou de l'Acheteur dans les autres cas. Les remboursements sont traités dans les 7 jours ouvrables suivant la confirmation du retour par la Plateforme.",
      },
      {
        heading: "8. Propriété Intellectuelle",
        body:
          "Tout le contenu de la Plateforme — y compris le nom Marrakech Maadine, le logo, le design, le logiciel et le contenu éditorial — est la propriété de Marrakech Maadine et protégé par le droit marocain et international de la propriété intellectuelle.\n\nLes Vendeurs conservent la propriété du contenu qu'ils publient (photos de produits, descriptions). En publiant du contenu, vous accordez à Marrakech Maadine une licence non exclusive et gratuite pour afficher, reproduire et promouvoir ce contenu aux fins d'exploitation et de marketing de la Plateforme.\n\nIl est interdit de scraper, copier ou reproduire le contenu de la Plateforme sans notre autorisation écrite.",
      },
      {
        heading: "9. Comportements Interdits",
        body:
          "Il est interdit de :\n\n• Tenter de contourner le système de paiement en traitant directement avec d'autres utilisateurs.\n• Publier de faux avis ou manipuler le système de notation.\n• Utiliser la Plateforme pour envoyer des spams, harceler d'autres utilisateurs ou distribuer des logiciels malveillants.\n• Tenter de pirater, rétro-concevoir ou perturber l'infrastructure de la Plateforme.\n• Créer plusieurs comptes pour échapper à une suspension.\n• Usurper l'identité d'un autre utilisateur, vendeur ou représentant de la Plateforme.\n\nLes violations peuvent entraîner la résiliation immédiate du compte et un signalement aux autorités marocaines.",
      },
      {
        heading: "10. Limitation de Responsabilité",
        body:
          "La Plateforme agit en tant que marketplace intermédiaire et ne fabrique pas, n'inspecte pas et ne garantit pas la qualité des produits vendus par les Vendeurs. Dans les limites permises par la loi :\n\n• Nous ne sommes pas responsables des dommages indirects, accessoires, spéciaux ou consécutifs découlant de votre utilisation de la Plateforme.\n• Notre responsabilité totale pour toute réclamation est limitée au montant que vous avez payé pour la transaction concernée.\n• Nous ne garantissons pas la disponibilité ininterrompue, sans erreur ou sans virus de la Plateforme.\n\nRien dans ces CGU ne limite la responsabilité en cas de fraude, de décès ou de préjudice corporel causé par notre négligence.",
      },
      {
        heading: "11. Résolution des Litiges",
        body:
          "En cas de litige entre un Acheteur et un Vendeur, les deux parties s'engagent à tenter d'abord une résolution via le processus de médiation de la Plateforme (accessible via le centre d'aide).\n\nEn cas d'échec de la médiation, les litiges seront soumis aux tribunaux compétents de Marrakech, Maroc, sauf disposition contraire du droit de la consommation applicable.\n\nPour les litiges entre Utilisateurs et la Plateforme, le droit marocain s'applique exclusivement.",
      },
      {
        heading: "12. Résiliation",
        body:
          "Vous pouvez fermer votre compte à tout moment depuis les paramètres de votre profil. Nous pouvons suspendre ou résilier votre compte à tout moment pour :\n\n• Violation des présentes CGU.\n• Activité frauduleuse.\n• Non-paiement de montants dus.\n• Inactivité supérieure à 24 mois (avec préavis).\n\nÀ la résiliation, votre accès aux fonctionnalités vendeur ou acheteur cessera immédiatement. Les commandes en cours seront traitées jusqu'à leur achèvement. La conservation des données est régie par notre Politique de Confidentialité.",
      },
      {
        heading: "13. Modifications",
        body:
          "Nous nous réservons le droit de modifier ces CGU à tout moment. Nous informerons les utilisateurs enregistrés par e-mail et afficherons un avis sur la Plateforme au moins 14 jours avant l'entrée en vigueur des modifications. L'utilisation continue de la Plateforme vaut acceptation des CGU révisées.",
      },
      {
        heading: "14. Droit Applicable",
        body:
          "Les présentes CGU sont régies par le droit du Royaume du Maroc. Tout litige non résolu par médiation sera soumis à la compétence exclusive des tribunaux compétents de Marrakech.",
      },
      {
        heading: "15. Contact",
        body:
          "Pour toute question relative à ces CGU, contactez-nous à maadinemarrakech@gmail.com ou écrivez à Marrakech Maadine, Médina, Marrakech, Maroc.",
      },
    ],
  },

  ar: {
    title: "شروط الاستخدام",
    updated: "آخر تحديث: 28 يونيو 2026",
    intro:
      "تحكم شروط الاستخدام هذه («الشروط») وصولكم إلى منصة مراكش معادن («المنصة») واستخدامكم لها، والتي تُشغّلها مراكش معادن («نحن»). بإنشاء حساب أو تقديم طلب أو نشر منتج، فإنكم توافقون على هذه الشروط بالكامل. في حال عدم الموافقة، يتعيّن عليكم عدم استخدام المنصة.",
    sections: [
      {
        heading: "١. التعريفات",
        body:
          "• **المنصة**: موقع مراكش معادن الإلكتروني وجميع الخدمات المرتبطة به.\n• **المستخدم**: أي شخص يصل إلى المنصة، سواء أكان مسجّلاً أم زائراً.\n• **المشتري**: مستخدم يشتري منتجات عبر المنصة.\n• **البائع**: مستخدم يعرض منتجات ويبيعها عبر المنصة.\n• **المشرف**: موظف في المنصة أو ممثل مفوّض عنها.\n• **الإدراج**: منتج أو خدمة معروض للبيع على المنصة.\n• **الطلب**: معاملة شراء مؤكّدة بين مشترٍ وبائع تيسّرها المنصة.",
      },
      {
        heading: "٢. شروط الأهلية",
        body:
          "يجب أن يكون عمركم 18 عاماً على الأقل لإنشاء حساب أو إجراء عملية شراء. باستخدامكم للمنصة، تؤكدون استيفاء هذا الشرط. المنصة مفتوحة للمستخدمين حول العالم، وإن كانت بعض الميزات قد تخضع لقيود بحسب موقعكم.\n\nيجب على البائعين امتلاك الحق القانوني لبيع المنتجات التي يعرضونها، سواء أكانوا صانعيها الأصليين أم موزّعين مصرّحاً لهم أم تجاراً مرخّصين بموجب القانون التجاري المغربي.",
      },
      {
        heading: "٣. تسجيل الحساب",
        body:
          "للوصول إلى كامل وظائف المنصة، يجب إنشاء حساب. أنتم توافقون على:\n\n• تقديم معلومات دقيقة وحديثة وكاملة عند التسجيل.\n• الحفاظ على سرية بيانات تسجيل الدخول وعدم مشاركتها مع أطراف ثالثة.\n• إخطارنا فوراً على maadinemarrakech@gmail.com في حال الاشتباه في وصول غير مصرّح لحسابكم.\n• تحمّل المسؤولية الكاملة عن جميع الأنشطة التي تتم من خلال حسابكم.\n\nنحتفظ بالحق في تعليق أو إنهاء الحسابات التي تُقدّم معلومات كاذبة أو تنتهك هذه الشروط.",
      },
      {
        heading: "٤. حسابات البائعين والاشتراكات",
        body:
          "يجب على البائعين التقدم بطلب للحصول على حساب بائع والحصول على موافقة المنصة. الموافقة تقديرية بالكامل من جانبنا.\n\nتُقدَّم حسابات البائعين ضمن خطط اشتراك («Starter» و«Managed» و«Premium»). بالاشتراك:\n\n• تفوّضوننا بخصم رسوم الاشتراك وفق دورة الفوترة المتفق عليها.\n• تتجدد الاشتراكات تلقائياً ما لم يتم الإلغاء قبل تاريخ التجديد.\n• لا تُعاد الرسوم عن الفترات الجزئية من الاشتراك.\n• نحتفظ بالحق في تعديل أسعار الاشتراك مع إشعار مسبق بـ 30 يوماً.\n\nسيفقد البائعون الذين لا يجدّدون اشتراكهم إمكانية الوصول إلى ميزات البائع؛ وستُعلَّق إدراجاتهم حتى استعادة الاشتراك.",
      },
      {
        heading: "٥. الإدراجات والمحتوى المحظور",
        body:
          "البائعون مسؤولون عن دقة إدراجاتهم وقانونيتها واكتمالها. يُحظر إدراج:\n\n• سلع مقلّدة أو مزيّفة أو معروضة بشكل مضلّل.\n• مقالات تنتهك حقوق الملكية الفكرية لأطراف ثالثة.\n• مقالات محظورة أو مقيّدة (أسلحة، مواد خاضعة للرقابة، حيوانات حية).\n• منتجات تخالف القانون المغربي أو العقوبات الدولية.\n• مقالات لا صلة لها بالحرف اليدوية (المنصة مخصّصة حصراً للمنتجات اليدوية الأصيلة).\n\nجميع الإدراجات خاضعة لمراجعة المشرفين. يجوز لنا إزالة أي إدراج حسب تقديرنا دون إشعار مسبق. الانتهاكات المتكررة تؤدي إلى تعليق الحساب بشكل دائم.",
      },
      {
        heading: "٦. الطلبات والمدفوعات",
        body:
          "عند تقديم المشتري لطلب، ينعقد عقد ملزم بين المشتري والبائع. تعمل المنصة بصفة وسيط يُيسّر المعاملة.\n\n• تُعرض الأسعار بالدرهم المغربي (MAD) ما لم يُشَر إلى خلاف ذلك.\n• تتم معالجة الدفع عند تأكيد الطلب.\n• تخصم المنصة رسوم خدمة على كل معاملة؛ يُنشر هيكل الرسوم الحالي في لوحة تحكم البائع.\n• يمكن إلغاء الطلبات خلال 24 ساعة من تقديمها إذا لم يشحن البائع المنتج بعد.\n• البائعون مسؤولون عن التقديرات الدقيقة للشحن والوفاء بالطلبات في الوقت المحدد.",
      },
      {
        heading: "٧. الإرجاع والاسترداد",
        body:
          "يجوز للمشترين طلب الإرجاع خلال 14 يوماً من الاستلام في حال:\n\n• كان المنتج المستلم يختلف جوهرياً عن وصفه.\n• وصل المنتج تالفاً أو معيباً.\n• تم شحن منتج خاطئ.\n\nالمنتجات المخصّصة أو المصنوعة بحسب الطلب غير قابلة للاسترداد إلا في حال وصولها تالفة أو معيبة.\n\nتقع تكاليف الإرجاع على عاتق البائع إذا كان الإرجاع بسبب خطئه، أو على عاتق المشتري في الحالات الأخرى. تُعالَج المبالغ المستردّة خلال 7 أيام عمل من تأكيد المنصة للإرجاع.",
      },
      {
        heading: "٨. الملكية الفكرية",
        body:
          "جميع محتويات المنصة — بما فيها اسم مراكش معادن والشعار والتصميم والبرمجيات والمحتوى التحريري — هي ملك لمراكش معادن ومحمية بموجب قانون الملكية الفكرية المغربي والدولي.\n\nيحتفظ البائعون بملكية المحتوى الذي ينشرونه (صور المنتجات، الأوصاف). بنشر المحتوى، تمنحون مراكش معادن ترخيصاً غير حصري وبلا مقابل لعرض هذا المحتوى وإعادة إنتاجه وترويجه بهدف تشغيل المنصة والتسويق لها.\n\nيُحظر استخراج محتوى المنصة أو نسخه أو إعادة إنتاجه دون إذن كتابي منّا.",
      },
      {
        heading: "٩. السلوكيات المحظورة",
        body:
          "يُحظر ما يلي:\n\n• محاولة التحايل على نظام الدفع بالتعامل المباشر مع مستخدمين آخرين.\n• نشر تقييمات كاذبة أو التلاعب بمنظومة التقييم.\n• استخدام المنصة لإرسال رسائل مزعجة أو مضايقة مستخدمين آخرين أو توزيع برامج ضارة.\n• محاولة اختراق البنية التحتية للمنصة أو عكس هندستها أو تعطيلها.\n• إنشاء حسابات متعددة للتهرب من التعليق أو الحظر.\n• انتحال هوية مستخدم أو بائع أو ممثل للمنصة.\n\nقد تؤدي الانتهاكات إلى إنهاء الحساب فوراً وإحالة الأمر إلى جهات إنفاذ القانون المغربية.",
      },
      {
        heading: "١٠. تحديد المسؤولية",
        body:
          "تعمل المنصة بصفة سوق وسيط ولا تصنع ولا تتفحص ولا تضمن جودة المنتجات التي يبيعها البائعون. في الحدود القصوى التي يسمح بها القانون:\n\n• لسنا مسؤولين عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية ناشئة عن استخدامكم للمنصة.\n• تقتصر مسؤوليتنا الإجمالية عن أي مطالبة على المبلغ الذي دفعتموه مقابل المعاملة التي أدّت إلى تلك المطالبة.\n• لا نضمن توافر المنصة بشكل متواصل أو خالٍ من الأخطاء أو الفيروسات.\n\nلا يحدّ شيء في هذه الشروط من المسؤولية في حالات الغش أو الوفاة أو الإصابة الجسدية الناجمة عن إهمالنا.",
      },
      {
        heading: "١١. حل النزاعات",
        body:
          "في حال نشوء نزاع بين مشترٍ وبائع، يتفق الطرفان على محاولة الحل أولاً من خلال عملية الوساطة الخاصة بالمنصة (المتاحة عبر مركز الدعم).\n\nفي حال فشل الوساطة، تُحال النزاعات إلى المحاكم المختصة في مراكش، المغرب، ما لم يستوجب قانون حماية المستهلك المطبّق خلاف ذلك.\n\nتخضع النزاعات بين المستخدمين والمنصة حصرياً للقانون المغربي.",
      },
      {
        heading: "١٢. إنهاء الحساب",
        body:
          "يمكنكم إغلاق حسابكم في أي وقت من إعدادات ملفكم الشخصي. يجوز لنا تعليق حسابكم أو إنهاؤه في أي وقت لأسباب منها:\n\n• انتهاك هذه الشروط.\n• النشاط الاحتيالي.\n• عدم دفع المبالغ المستحقة.\n• عدم النشاط لأكثر من 24 شهراً (مع إشعار مسبق).\n\nعند الإنهاء، يتوقف وصولكم إلى ميزات البائع أو المشتري فوراً. ستُكتمل الطلبات القائمة. يخضع الاحتفاظ بالبيانات لسياسة الخصوصية الخاصة بنا.",
      },
      {
        heading: "١٣. التعديلات",
        body:
          "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنخطر المستخدمين المسجّلين بالبريد الإلكتروني وننشر إشعاراً على المنصة قبل 14 يوماً على الأقل من دخول التغييرات حيّز التنفيذ. الاستمرار في استخدام المنصة بعد ذلك يُعدّ قبولاً للشروط المحدّثة.",
      },
      {
        heading: "١٤. القانون الحاكم",
        body:
          "تخضع هذه الشروط لقوانين المملكة المغربية. يُحال أي نزاع لم يُحسم بالوساطة إلى الاختصاص الحصري للمحاكم المختصة في مراكش.",
      },
      {
        heading: "١٥. التواصل",
        body:
          "لأي أسئلة بشأن هذه الشروط، تواصلوا معنا على: maadinemarrakech@gmail.com أو راسلوا: مراكش معادن، المدينة العتيقة، مراكش، المغرب.",
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

export default async function TermsPage({
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

      {/* Table of contents */}
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <div className="bg-white rounded-2xl border border-stone/10 shadow-sm p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#c9a96e] mb-4">
            {locale === "ar" ? "جدول المحتويات" : locale === "fr" ? "Table des matières" : "Table of Contents"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {content.sections.map((s, i) => (
              <p key={i} className="text-xs text-[#6b6460] py-0.5">{s.heading}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <p className="text-[#4a4440] text-sm leading-relaxed p-5 bg-white rounded-2xl border border-stone/10 shadow-sm">
          {content.intro}
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {content.sections.map((section) => (
            <section key={section.heading} className="bg-white rounded-2xl border border-stone/10 shadow-sm p-6 sm:p-8">
              <h2 className="font-display text-lg text-[#1f1b16] mb-4 pb-3 border-b border-stone/10">
                {section.heading}
              </h2>
              {renderBody(section.body)}
            </section>
          ))}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-[#8b8378]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {locale === "ar" ? "هذه الشروط ملزمة قانونياً وتحكم استخدامكم لمنصة مراكش معادن." : locale === "fr" ? "Ces CGU sont juridiquement contraignantes et régissent votre utilisation de Marrakech Maadine." : "These Terms are legally binding and govern your use of the Marrakech Maadine platform."}
          </div>
        </div>
      </div>
    </div>
  );
}
