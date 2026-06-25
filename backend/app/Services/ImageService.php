<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class ImageService
{
    /**
     * Upload a file to Cloudinary and return its secure URL.
     *
     * @param  UploadedFile  $file
     * @param  string  $folder  e.g. "products", "stores/logos"
     * @return string  The Cloudinary secure HTTPS URL
     */
    public function upload(UploadedFile $file, string $folder): string
    {
        $result = cloudinary()->uploadApi()->upload($file->getRealPath(), [
            'folder'         => "maadin/{$folder}",
            'quality'        => 'auto',
            'fetch_format'   => 'auto',
        ]);

        if (!$result || !isset($result['secure_url'])) {
            throw new \RuntimeException('Cloudinary upload failed — no secure_url returned.');
        }

        return $result['secure_url'];
    }

    /**
     * Delete an image from Cloudinary by its stored URL.
     * Safe to call with a local path or null — it just skips.
     */
    public function delete(?string $url): void
    {
        if (!$url || !str_contains($url, 'cloudinary.com')) {
            return;
        }

        $publicId = $this->extractPublicId($url);

        if ($publicId) {
            cloudinary()->uploadApi()->destroy($publicId);
        }
    }

    /**
     * Extract the Cloudinary public_id from a secure URL.
     * URL format: https://res.cloudinary.com/{cloud}/image/upload/v{ver}/{public_id}.{ext}
     */
    private function extractPublicId(string $url): ?string
    {
        if (preg_match('/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
