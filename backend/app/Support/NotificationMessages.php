<?php

namespace App\Support;

class NotificationMessages
{
    // All translatable notification strings keyed by [event][locale]
    private static array $messages = [
        // ── Order placed (to seller) ──────────────────────────────────────────
        'order.placed' => [
            'en' => ['🛒 New order received!',  '{number} · {amount} MAD'],
            'fr' => ['🛒 Nouvelle commande !',   '{number} · {amount} MAD'],
            'ar' => ['🛒 طلب جديد!',              '{number} · {amount} درهم'],
        ],

        // ── Order status changes (to customer) ───────────────────────────────
        'order.confirmed' => [
            'en' => ['🎉 Order confirmed!',    'Your order {number} has been confirmed and is being prepared.'],
            'fr' => ['🎉 Commande confirmée !', 'Votre commande {number} a été confirmée et est en cours de préparation.'],
            'ar' => ['🎉 تم تأكيد الطلب!',     'تم تأكيد طلبك {number} وهو قيد التحضير.'],
        ],
        'order.shipped' => [
            'en' => ['🚚 Order shipped!',    'Your order {number} is on its way!{tracking}'],
            'fr' => ['🚚 Commande expédiée !', 'Votre commande {number} est en route !{tracking}'],
            'ar' => ['🚚 تم شحن الطلب!',     'طلبك {number} في الطريق إليك!{tracking}'],
        ],
        'order.delivered' => [
            'en' => ['✅ Order delivered!',   'Your order {number} has been delivered. Enjoy!'],
            'fr' => ['✅ Commande livrée !',   'Votre commande {number} a été livrée. Profitez-en !'],
            'ar' => ['✅ تم تسليم الطلب!',    'تم تسليم طلبك {number}. استمتع بمشترياتك!'],
        ],
        'order.cancelled' => [
            'en' => ['❌ Order cancelled',    'Your order {number} has been cancelled by the seller.'],
            'fr' => ['❌ Commande annulée',   'Votre commande {number} a été annulée par le vendeur.'],
            'ar' => ['❌ تم إلغاء الطلب',     'تم إلغاء طلبك {number} من قِبل البائع.'],
        ],

        // ── Review received (to seller) ───────────────────────────────────────
        'review.received' => [
            'en' => ['⭐ New review on {product}', 'A customer left a {rating}-star review on your product.'],
            'fr' => ['⭐ Nouvel avis sur {product}', 'Un client a laissé un avis {rating} étoile(s) sur votre produit.'],
            'ar' => ['⭐ تقييم جديد على {product}', 'ترك أحد العملاء تقييم {rating} نجوم على منتجك.'],
        ],

        // ── Subscription lifecycle (to seller) ────────────────────────────────
        'subscription.expiring_soon' => [
            'en' => ['⏰ Subscription expiring in {days} days', 'Your {plan} subscription expires on {date}. Contact us to renew and keep your store active.'],
            'fr' => ['⏰ Abonnement expire dans {days} jours', 'Votre abonnement {plan} expire le {date}. Contactez-nous pour renouveler et garder votre boutique active.'],
            'ar' => ['⏰ الاشتراك ينتهي خلال {days} أيام', 'اشتراكك في خطة {plan} ينتهي في {date}. تواصل معنا للتجديد والإبقاء على متجرك نشطاً.'],
        ],
        'subscription.expired' => [
            'en' => ['🚫 Subscription expired', 'Your {plan} subscription expired on {date}. Your store has been paused. Renew to reactivate.'],
            'fr' => ['🚫 Abonnement expiré', 'Votre abonnement {plan} a expiré le {date}. Votre boutique est suspendue. Renouvelez pour la réactiver.'],
            'ar' => ['🚫 انتهى الاشتراك', 'انتهى اشتراكك في خطة {plan} بتاريخ {date}. تم إيقاف متجرك مؤقتاً. جدد للاستمرار.'],
        ],
        'subscription.renewed' => [
            'en' => ['✅ Subscription renewed!', 'Your {plan} subscription has been renewed until {date}. Your store is now active.'],
            'fr' => ['✅ Abonnement renouvelé !', 'Votre abonnement {plan} a été renouvelé jusqu\'au {date}. Votre boutique est maintenant active.'],
            'ar' => ['✅ تم تجديد الاشتراك!', 'تم تجديد اشتراكك في خطة {plan} حتى {date}. متجرك نشط الآن.'],
        ],
        'plan.upgrade_requested' => [
            'en' => ['📋 Upgrade request received', 'Your request to upgrade from {from} to {to} has been received. We will contact you shortly.'],
            'fr' => ['📋 Demande de mise à niveau reçue', 'Votre demande de passage de {from} à {to} a été reçue. Nous vous contacterons bientôt.'],
            'ar' => ['📋 تم استلام طلب الترقية', 'تم استلام طلبك للترقية من {from} إلى {to}. سنتواصل معك قريباً.'],
        ],
        'plan.upgrade_approved' => [
            'en' => ['🎉 Plan upgraded to {to}!', 'Congratulations! Your store is now on the {to} plan. Your store will resume activity.'],
            'fr' => ['🎉 Plan mis à niveau vers {to} !', 'Félicitations ! Votre boutique est maintenant sur le plan {to}. Votre boutique reprendra son activité.'],
            'ar' => ['🎉 تمت الترقية إلى خطة {to}!', 'تهانينا! متجرك الآن على خطة {to}. سيستأنف متجرك نشاطه.'],
        ],
        'plan.upgrade_rejected' => [
            'en' => ['❌ Upgrade request declined', 'Your request to upgrade to {to} was not approved at this time. Please contact us for details.'],
            'fr' => ['❌ Demande de mise à niveau refusée', 'Votre demande de mise à niveau vers {to} n\'a pas été approuvée. Contactez-nous pour plus de détails.'],
            'ar' => ['❌ تم رفض طلب الترقية', 'لم يتم الموافقة على طلبك للترقية إلى {to} في الوقت الحالي. تواصل معنا للمزيد.'],
        ],

        // ── Admin alerts ──────────────────────────────────────────────────────
        'admin.subscription_expired' => [
            'en' => ['🚫 Seller subscription expired', '{name} ({plan}) subscription expired on {date}. Store suspended.'],
            'fr' => ['🚫 Abonnement vendeur expiré', 'L\'abonnement {plan} de {name} a expiré le {date}. Boutique suspendue.'],
            'ar' => ['🚫 انتهى اشتراك البائع', 'انتهى اشتراك {name} ({plan}) بتاريخ {date}. تم تعليق المتجر.'],
        ],
        'admin.upgrade_requested' => [
            'en' => ['📋 Seller upgrade request', '{name} wants to upgrade from {from} to {to}. Review in the admin panel.'],
            'fr' => ['📋 Demande de mise à niveau vendeur', '{name} souhaite passer de {from} à {to}. Vérifiez dans le panneau admin.'],
            'ar' => ['📋 طلب ترقية من بائع', '{name} يريد الترقية من {from} إلى {to}. راجع في لوحة الإدارة.'],
        ],

        // ── New message (to receiver) ─────────────────────────────────────────
        'message.received' => [
            'en' => ['💬 New message from {sender}', '{preview}'],
            'fr' => ['💬 Nouveau message de {sender}', '{preview}'],
            'ar' => ['💬 رسالة جديدة من {sender}', '{preview}'],
        ],

        // ── Product approved / rejected (to seller) ───────────────────────────
        'product.approved' => [
            'en' => ['✅ Product approved', 'Your product "{product}" is now live on the marketplace.'],
            'fr' => ['✅ Produit approuvé', 'Votre produit "{product}" est maintenant en ligne sur la marketplace.'],
            'ar' => ['✅ تمت الموافقة على المنتج', 'منتجك "{product}" متاح الآن في السوق.'],
        ],
        'product.rejected' => [
            'en' => ['❌ Product rejected', 'Your product "{product}" was not approved. Please review and resubmit.'],
            'fr' => ['❌ Produit refusé', 'Votre produit "{product}" n\'a pas été approuvé. Veuillez revoir et resoumettre.'],
            'ar' => ['❌ تم رفض المنتج', 'لم تتم الموافقة على منتجك "{product}". يرجى المراجعة وإعادة الإرسال.'],
        ],
    ];

    public static function get(string $event, string $locale, array $vars = []): array
    {
        $locale = in_array($locale, ['en', 'fr', 'ar']) ? $locale : 'en';
        [$title, $body] = self::$messages[$event][$locale] ?? self::$messages[$event]['en'];

        foreach ($vars as $key => $value) {
            $title = str_replace('{' . $key . '}', $value, $title);
            $body  = str_replace('{' . $key . '}', $value, $body);
        }

        return [$title, $body];
    }
}
