<?php

namespace App\Services;

class ContentFilterService
{
    private array $patterns = [
        'phone_number' => '/(\+212|0)[\s.-]?[5-7](?:[\s.-]?\d){8}/',
        'email' => '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/',
        'whatsapp' => '/(wa\.me\/\S+|whatsapp)/i',
        'url' => '/(https?:\/\/\S+|www\.\S+)/i',
        'social_handle' => '/(@[a-zA-Z0-9_]{3,}|#[a-zA-Z0-9_]{3,})/',
    ];

    /**
     * Filters the content, masking any detected sensitive patterns.
     *
     * @return array{content: string, has_blocked_content: bool, blocked_patterns: array}
     */
    public function filter(string $content): array
    {
        $detected = [];
        $filtered = $content;

        foreach ($this->patterns as $type => $regex) {
            if (preg_match($regex, $filtered)) {
                $detected[] = $type;
                $filtered = preg_replace($regex, '[hidden]', $filtered);
            }
        }

        return [
            'content' => $filtered,
            'has_blocked_content' => count($detected) > 0,
            'blocked_patterns' => $detected,
        ];
    }
}