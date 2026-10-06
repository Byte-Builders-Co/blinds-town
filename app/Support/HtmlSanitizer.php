<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Allow-list HTML sanitizer for admin-authored rich text (CMS pages).
 *
 * Only a small set of formatting elements survive; everything else is
 * unwrapped (its text kept) and script/style-like elements are dropped
 * entirely. The only attributes kept are a safe href on links.
 */
class HtmlSanitizer
{
    /** @var array<int, string> */
    private const ALLOWED_TAGS = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'h4',
        'ul', 'ol', 'li', 'blockquote', 'hr', 'a', 'code', 'pre',
    ];

    /** @var array<int, string> */
    private const DROPPED_TAGS = [
        'script', 'style', 'iframe', 'object', 'embed', 'form', 'input',
        'button', 'textarea', 'select', 'svg', 'math', 'link', 'meta', 'noscript',
    ];

    public static function clean(?string $html): ?string
    {
        $html = trim((string) $html);

        if ($html === '') {
            return null;
        }

        $previous = libxml_use_internal_errors(true);

        $document = new DOMDocument('1.0', 'UTF-8');
        $document->loadHTML(
            '<?xml encoding="UTF-8"><div id="sanitizer-root">'.$html.'</div>',
            LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_HTML_NODEFDTD | LIBXML_HTML_NOIMPLIED,
        );

        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $document->getElementById('sanitizer-root');

        if (! $root instanceof DOMElement) {
            return null;
        }

        self::sanitizeChildren($root);

        $output = '';

        foreach ($root->childNodes as $child) {
            $output .= $document->saveHTML($child);
        }

        $output = trim($output);

        return $output === '' ? null : $output;
    }

    private static function sanitizeChildren(DOMNode $parent): void
    {
        foreach (iterator_to_array($parent->childNodes) as $child) {
            if (! $child instanceof DOMElement) {
                if ($child->nodeType === XML_COMMENT_NODE) {
                    $parent->removeChild($child);
                }

                continue;
            }

            $tag = strtolower($child->tagName);

            if (in_array($tag, self::DROPPED_TAGS, true)) {
                $parent->removeChild($child);

                continue;
            }

            self::sanitizeChildren($child);

            if (! in_array($tag, self::ALLOWED_TAGS, true)) {
                while ($child->firstChild) {
                    $parent->insertBefore($child->firstChild, $child);
                }

                $parent->removeChild($child);

                continue;
            }

            self::sanitizeAttributes($child, $tag);
        }
    }

    private static function sanitizeAttributes(DOMElement $element, string $tag): void
    {
        $href = $tag === 'a' ? trim($element->getAttribute('href')) : '';

        foreach (iterator_to_array($element->attributes) as $attribute) {
            $element->removeAttributeNode($attribute);
        }

        if ($tag === 'a' && self::isSafeUrl($href)) {
            $element->setAttribute('href', $href);

            if (preg_match('#^https?://#i', $href)) {
                $element->setAttribute('target', '_blank');
                $element->setAttribute('rel', 'noopener noreferrer');
            }
        }
    }

    private static function isSafeUrl(string $url): bool
    {
        if ($url === '') {
            return false;
        }

        // Relative URLs and anchors are fine; otherwise allow an explicit scheme list.
        if (preg_match('#^(/(?!/)|\#|\?)#', $url)) {
            return true;
        }

        return (bool) preg_match('#^(https?://|mailto:|tel:)#i', $url);
    }
}
