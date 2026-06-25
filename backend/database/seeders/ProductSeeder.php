<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Seller;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Map seller store names to categories + products
        $catalog = [
            'Layla Pottery' => [
                'category' => 'Pottery',
                'products' => [
                    ['name' => 'Zellige Mosaic Tagine',        'price' => 380,  'stock' => 15, 'desc' => 'Hand-painted geometric zellige tagine from Fès, oven-safe. Each piece is unique.'],
                    ['name' => 'Terracotta Serving Bowl',       'price' => 120,  'stock' => 30, 'desc' => 'Classic terracotta bowl, perfect for serving salads or fruit. Food-safe glaze.'],
                    ['name' => 'Hand-painted Espresso Cup Set', 'price' => 210,  'stock' => 20, 'desc' => 'Set of 4 hand-painted ceramic espresso cups with traditional Moroccan motifs.'],
                    ['name' => 'Decorative Wall Plate',         'price' => 95,   'stock' => 25, 'desc' => 'Painted blue and white wall plate, 30cm diameter. Ideal decorative piece.'],
                ],
            ],
            'Tazi Leather' => [
                'category' => 'Leather Goods',
                'products' => [
                    ['name' => 'Yellow Babouche Slippers',     'price' => 150,  'stock' => 40, 'desc' => 'Classic Marrakchi babouche in natural yellow leather. Handstitched by artisans.'],
                    ['name' => 'Leather Shoulder Bag',          'price' => 450,  'stock' => 12, 'desc' => 'Soft genuine goat leather bag with Moroccan embossed pattern. Adjustable strap.'],
                    ['name' => 'Embossed Leather Wallet',       'price' => 180,  'stock' => 35, 'desc' => 'Slim bifold wallet in hand-embossed camel leather with multiple card slots.'],
                ],
            ],
            'Ouazzani Textiles' => [
                'category' => 'Textiles',
                'products' => [
                    ['name' => 'Beni Ourain Wool Rug 120×180', 'price' => 1200, 'stock' => 5,  'desc' => 'Authentic Beni Ourain rug, hand-knotted by Berber women. Natural undyed wool.'],
                    ['name' => 'Pompom Throw Blanket',          'price' => 280,  'stock' => 18, 'desc' => 'Cotton and wool blend blanket with colourful pompom trim. Machine washable.'],
                    ['name' => 'Berber Cushion Cover',          'price' => 95,   'stock' => 50, 'desc' => 'Flat-weave cushion cover with traditional geometric diamond pattern. 45×45cm.'],
                ],
            ],
            'Tahiri Lamps' => [
                'category' => 'Metalwork',
                'products' => [
                    ['name' => 'Brass Star Lantern Large',      'price' => 650,  'stock' => 8,  'desc' => 'Hand-pierced brass lantern with 8-point star pattern. 40cm height. Includes E27 fitting.'],
                    ['name' => 'Copper Pendant Lamp',           'price' => 420,  'stock' => 14, 'desc' => 'Hammered copper ceiling pendant with intricate floral cutouts. 30cm diameter.'],
                    ['name' => 'Table Lantern Trio Set',        'price' => 380,  'stock' => 10, 'desc' => 'Set of 3 small brass table lanterns in varying heights. Perfect as a centrepiece.'],
                    ['name' => 'Moroccan Floor Lamp',           'price' => 900,  'stock' => 6,  'desc' => 'Standing floor lamp in wrought iron with coloured glass mosaic panels. 150cm.'],
                ],
            ],
            'Idrissi Jewels' => [
                'category' => 'Jewelry',
                'products' => [
                    ['name' => 'Berber Silver Cuff Bracelet',   'price' => 320,  'stock' => 20, 'desc' => 'Wide sterling silver cuff with hand-stamped Tifinagh script. Adjustable size.'],
                    ['name' => 'Fatima Hand Pendant Necklace',  'price' => 185,  'stock' => 30, 'desc' => 'Delicate Khamsa pendant on an 18" oxidised silver chain. 925 silver.'],
                    ['name' => 'Amber Resin Earrings',          'price' => 140,  'stock' => 25, 'desc' => 'Oval amber resin drop earrings set in silver filigree. Lightweight and elegant.'],
                ],
            ],
        ];

        foreach ($catalog as $storeName => $data) {
            $seller = Seller::where('store_name', $storeName)->first();
            if (! $seller) continue;

            $category = \App\Models\Category::where('name', $data['category'])->first();
            if (! $category) continue;

            foreach ($data['products'] as $i => $p) {
                Product::create([
                    'seller_id'      => $seller->id,
                    'category_id'    => $category->id,
                    'name'           => $p['name'],
                    'slug'           => $this->uniqueSlug($p['name']),
                    'description'    => $p['desc'],
                    'price'          => $p['price'],
                    'stock_quantity' => $p['stock'],
                    'is_active'      => true,
                    'is_approved'    => true,
                ]);
            }
        }

        // Add one pending product (not yet approved) for Layla
        $layla = Seller::where('store_name', 'Layla Pottery')->first();
        $cat   = \App\Models\Category::where('name', 'Pottery')->first();
        if ($layla && $cat) {
            Product::create([
                'seller_id'      => $layla->id,
                'category_id'    => $cat->id,
                'name'           => 'Blue Glazed Tajine Lid',
                'slug'           => 'blue-glazed-tajine-lid',
                'description'    => 'Replacement tajine lid in blue celadon glaze. Fits standard 28cm base.',
                'price'          => 75,
                'stock_quantity' => 20,
                'is_active'      => true,
                'is_approved'    => false, // pending admin approval
            ]);
        }
    }

    private function uniqueSlug(string $name): string
    {
        $slug = Str::slug($name); $orig = $slug; $i = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = "{$orig}-{$i}"; $i++;
        }
        return $slug;
    }
}
