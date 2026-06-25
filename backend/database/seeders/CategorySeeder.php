<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $tree = [
            [
                'name' => 'Pottery',
                'ar'   => 'الفخار',
                'fr'   => 'Poterie',
                'order' => 1,
                'children' => [
                    ['name' => 'Zellige',                    'ar' => 'الزليج',                   'fr' => 'Zellige'],
                    ['name' => 'Tagines & Terracotta',       'ar' => 'الطاجين والفخار الخام',    'fr' => 'Tagines & Terre cuite'],
                    ['name' => 'Fès Blue Ceramics',          'ar' => 'الخزف الأزرق الفاسي',      'fr' => 'Céramique peinte de Fès'],
                    ['name' => 'Decorative Vases & Bowls',   'ar' => 'مزهريات وأواني زينة',      'fr' => 'Vases & Bols décoratifs'],
                    ['name' => 'Ceramic Tea Sets',           'ar' => 'أطقم الشاي الخزفية',       'fr' => 'Services à thé en céramique'],
                ],
            ],
            [
                'name' => 'Leather Goods',
                'ar'   => 'الجلد',
                'fr'   => 'Maroquinerie',
                'order' => 2,
                'children' => [
                    ['name' => 'Babouche & Shoes',           'ar' => 'البلغة والأحذية',           'fr' => 'Babouches & Chaussures'],
                    ['name' => 'Bags & Clutches',            'ar' => 'الحقائب والمحافظ',          'fr' => 'Sacs & Pochettes'],
                    ['name' => 'Belts & Wallets',            'ar' => 'الأحزمة والمحافظ',          'fr' => 'Ceintures & Portefeuilles'],
                    ['name' => 'Leather Poufs & Cushions',   'ar' => 'البوف ووسائد الجلد',        'fr' => 'Poufs & Coussins en cuir'],
                    ['name' => 'Leather Bookbinding & Desk', 'ar' => 'التجليد وأدوات المكتب',    'fr' => 'Reliure & Articles de bureau'],
                ],
            ],
            [
                'name' => 'Textiles',
                'ar'   => 'النسيج',
                'fr'   => 'Textiles',
                'order' => 3,
                'children' => [
                    ['name' => 'Rabati Embroidery',          'ar' => 'التطريز الرباطي',           'fr' => 'Broderie Rabatie'],
                    ['name' => 'Fassi Embroidery',           'ar' => 'التطريز الفاسي',            'fr' => 'Broderie Fassia'],
                    ['name' => 'Chefchaouni Embroidery',     'ar' => 'التطريز الشفشاوني',         'fr' => 'Broderie Chefchaounia'],
                    ['name' => 'Djellabas & Kaftans',        'ar' => 'الجلابية والقفطان',         'fr' => 'Djellabas & Kaftans'],
                    ['name' => 'Embroidered Table Linen',    'ar' => 'المفارش والمناشف المطرزة',  'fr' => 'Nappe & Linge de maison brodé'],
                ],
            ],
            [
                'name' => 'Rugs & Carpets',
                'ar'   => 'الزرابي',
                'fr'   => 'Tapis',
                'order' => 4,
                'children' => [
                    ['name' => 'Beni Ourain',                'ar' => 'بني وراين',                 'fr' => 'Beni Ourain'],
                    ['name' => 'Kilim',                      'ar' => 'الكليم',                    'fr' => 'Kilim'],
                    ['name' => 'Boucherouite',               'ar' => 'البوشرويط',                 'fr' => 'Boucherouite'],
                    ['name' => 'Hanbel & Zanafi',            'ar' => 'الحنبل والزنافي',           'fr' => 'Hanbel & Zanafi'],
                    ['name' => 'Prayer Rugs',                'ar' => 'سجادة الصلاة',              'fr' => 'Tapis de prière'],
                ],
            ],
            [
                'name' => 'Woodwork',
                'ar'   => 'النجارة',
                'fr'   => 'Menuiserie',
                'order' => 5,
                'children' => [
                    ['name' => 'Thuya Marquetry',            'ar' => 'خاتم الأرز الصويري',        'fr' => 'Marqueterie en thuya'],
                    ['name' => 'Carved Cedar',               'ar' => 'الأرز المنحوت',             'fr' => 'Bois de cèdre sculpté'],
                    ['name' => 'Painted Trays & Tables',     'ar' => 'الصواني والطاولات المزخرفة','fr' => 'Plateaux & Tables peints'],
                    ['name' => 'Mirrors & Wooden Frames',    'ar' => 'المرايا والإطارات الخشبية', 'fr' => 'Miroirs & Cadres en bois'],
                    ['name' => 'Carved Doors & Panels',      'ar' => 'الأبواب والألواح المنحوتة', 'fr' => 'Portes & Panneaux sculptés'],
                ],
            ],
            [
                'name' => 'Metalwork',
                'ar'   => 'النحاس والحديد',
                'fr'   => 'Dinanderie',
                'order' => 6,
                'children' => [
                    ['name' => 'Brass & Copper Lanterns',    'ar' => 'الفوانيس النحاسية والبرونزية','fr' => 'Lanternes & Fanous en laiton'],
                    ['name' => 'Engraved Trays & Teapots',   'ar' => 'الصواني وأباريق الشاي المنقوشة','fr' => 'Plateaux & Théières gravés'],
                    ['name' => 'Candleholders & Photophores','ar' => 'حاملات الشموع والفوانيس',   'fr' => 'Bougeoirs & Photophores en cuivre'],
                    ['name' => 'Wrought Iron Furniture',     'ar' => 'أثاث الحديد المطروق',       'fr' => 'Mobilier en fer forgé'],
                    ['name' => 'Artisan Locks & Handles',    'ar' => 'الأقفال والمقابض التقليدية','fr' => 'Serrures & Poignées artisanales'],
                ],
            ],
            [
                'name' => 'Jewelry',
                'ar'   => 'المجوهرات',
                'fr'   => 'Bijouterie',
                'order' => 7,
                'children' => [
                    ['name' => 'Berber Silver Jewelry',      'ar' => 'المجوهرات الأمازيغية الفضية','fr' => 'Bijoux berbères en argent'],
                    ['name' => 'Engraved Bracelets & Rings', 'ar' => 'الأساور والخواتم المنقوشة', 'fr' => 'Bracelets & Bagues gravés'],
                    ['name' => 'Amber & Coral Necklaces',    'ar' => 'قلائد الكهرمان والمرجان',   'fr' => 'Colliers ambre & corail'],
                    ['name' => 'Bridal Accessories',         'ar' => 'إكسسوارات العروس',          'fr' => 'Accessoires de mariée'],
                    ['name' => 'Fibules & Traditional Brooches','ar' => 'الإبزيم والمشابك التقليدية','fr' => 'Fibules & Broches traditionnelles'],
                ],
            ],
            [
                'name' => 'Beauty & Fragrance',
                'ar'   => 'العناية والعطور',
                'fr'   => 'Soins & Parfums',
                'order' => 8,
                'children' => [
                    ['name' => 'Argan & Vegetable Oils',     'ar' => 'زيت أركان والزيوت النباتية','fr' => 'Argan & Huiles végétales'],
                    ['name' => 'Savon Beldi & Ghassoul',     'ar' => 'الصابون البلدي والغاسول',   'fr' => 'Savon beldi & Ghassoul'],
                    ['name' => 'Henna & Kohl',               'ar' => 'الحناء والكحل',             'fr' => 'Henné & Khôl'],
                    ['name' => 'Floral Waters',              'ar' => 'ماء الورد وماء الزهر',       'fr' => 'Eaux florales'],
                    ['name' => 'Bkhour & Incense',           'ar' => 'البخور والعود',              'fr' => 'Bkhour & Encens'],
                    ['name' => 'Attars & Perfumes',          'ar' => 'العطور والاتار',             'fr' => 'Parfums & Attars'],
                    ['name' => 'Artisan Candles',            'ar' => 'الشموع اليدوية',            'fr' => 'Bougies artisanales'],
                    ['name' => 'Incense Burners & Holders',  'ar' => 'مباخر وحاملات الشموع',      'fr' => 'Brûle-parfums & Bougeoirs'],
                ],
            ],
            [
                'name' => 'Art & Calligraphy',
                'ar'   => 'الفن والخط',
                'fr'   => 'Art & Calligraphie',
                'order' => 9,
                'children' => [
                    ['name' => 'Arabic Calligraphy',         'ar' => 'الخط العربي',               'fr' => 'Calligraphie arabe'],
                    ['name' => 'Silk & Leather Painting',    'ar' => 'الرسم على الحرير والجلد',   'fr' => 'Peinture sur soie & cuir'],
                    ['name' => 'Tadelakt & Plaster Art',     'ar' => 'التدلاكت وفن الجبس',        'fr' => 'Art du tadelakt & plâtre'],
                    ['name' => 'Illumination & Miniature',   'ar' => 'التذهيب والمنمنمات',        'fr' => 'Enluminure & Miniature'],
                    ['name' => 'Stone & Marble Sculpture',   'ar' => 'النحت على الحجر والرخام',   'fr' => 'Sculpture sur pierre & marbre'],
                ],
            ],
        ];

        foreach ($tree as $parent) {
            $parentId = DB::table('categories')->insertGetId([
                'name'          => $parent['name'],
                'name_fr'       => $parent['fr'],
                'name_ar'       => $parent['ar'],
                'slug'          => Str::slug($parent['name']),
                'display_order' => $parent['order'],
                'is_active'     => true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            foreach ($parent['children'] as $i => $child) {
                DB::table('categories')->insert([
                    'name'          => $child['name'],
                    'name_fr'       => $child['fr'],
                    'name_ar'       => $child['ar'],
                    'slug'          => Str::slug($child['name']),
                    'parent_id'     => $parentId,
                    'display_order' => $i + 1,
                    'is_active'     => true,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }
        }
    }
}
