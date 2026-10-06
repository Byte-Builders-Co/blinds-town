@props([
    'code',
    'title',
    'message',
    'retry' => false,
    'retryLabel' => 'Try again',
    'icon' => 'alert',
])
@php
    $appearance = request()->cookie('appearance', 'system');
    $icons = [
        'alert' => '<path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
        'search' => '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
        'lock' => '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        'clock' => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        'wrench' => '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5Z"/>',
    ];
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => $appearance === 'dark'])>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>{{ $code }} · {{ $title }} — {{ config('app.name', 'Blinds Town') }}</title>
    <link rel="icon" href="/favicon.png">
    @if ($appearance === 'system')
        <script>
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            }
        </script>
    @endif
    <style>
        :root {
            --bg: oklch(0.975 0.012 75);
            --card: oklch(0.995 0.006 75);
            --fg: oklch(0.22 0.014 150);
            --muted: oklch(0.48 0.02 100);
            --border: oklch(0.89 0.014 75);
            --primary: oklch(0.657 0.192 24.1);
            --primary-fg: #fff;
            --hover: oklch(0.94 0.012 75);
            --shadow: 0 1px 2px rgb(15 17 17 / 6%), 0 8px 24px rgb(15 17 17 / 6%);
        }
        .dark {
            color-scheme: dark;
            --bg: oklch(0.14 0.005 250);
            --card: oklch(0.18 0.006 250);
            --fg: oklch(0.965 0.004 250);
            --muted: oklch(0.72 0.012 250);
            --border: oklch(1 0 0 / 8%);
            --primary: oklch(0.69 0.185 24.1);
            --primary-fg: oklch(0.16 0.01 24);
            --hover: oklch(0.255 0.009 250);
            --shadow: inset 0 1px 0 oklch(1 0 0 / 4%);
        }
        * { box-sizing: border-box; margin: 0; }
        body {
            min-height: 100svh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 28px;
            padding: 24px 16px;
            background: var(--bg);
            color: var(--fg);
            font-family: "Instrument Sans", ui-sans-serif, system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .logo img { height: 32px; width: auto; display: block; }
        .dark .logo { background: #fff; border-radius: 6px; padding: 4px 8px; }
        .card {
            width: 100%;
            max-width: 440px;
            padding: 40px 32px 32px;
            text-align: center;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            box-shadow: var(--shadow);
        }
        .icon {
            width: 48px; height: 48px;
            margin: 0 auto 16px;
            display: grid; place-items: center;
            border-radius: 12px;
            color: var(--primary);
            background: color-mix(in oklch, var(--primary) 12%, transparent);
        }
        .icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
        .code { font-size: 13px; font-weight: 600; letter-spacing: .12em; color: var(--muted); }
        h1 { margin-top: 8px; font-size: 24px; font-weight: 600; line-height: 1.25; letter-spacing: -.01em; }
        p { margin-top: 10px; font-size: 14.5px; line-height: 1.6; color: var(--muted); }
        .actions { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; }
        @media (min-width: 480px) { .actions { flex-direction: row; justify-content: center; } }
        .btn {
            display: inline-flex; align-items: center; justify-content: center;
            min-height: 40px; padding: 0 18px;
            border-radius: 8px; border: 1px solid var(--border);
            font: inherit; font-size: 14px; font-weight: 500;
            color: var(--fg); background: transparent; text-decoration: none; cursor: pointer;
            transition: background-color .15s, box-shadow .15s;
        }
        .btn:hover { background: var(--hover); }
        .btn-primary { background: var(--primary); border-color: transparent; color: var(--primary-fg); }
        .btn-primary:hover { background: color-mix(in oklch, var(--primary) 90%, black); }
        .btn:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 45%, transparent); }
        .foot { font-size: 12px; color: var(--muted); }
        @media (prefers-reduced-motion: reduce) { .btn { transition: none; } }
    </style>
</head>
<body>
    <a href="/" class="logo" aria-label="{{ config('app.name', 'Blinds Town') }}">
        <img src="/logo.png" alt="{{ config('app.name', 'Blinds Town') }}">
    </a>

    <main class="card">
        <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">{!! $icons[$icon] ?? $icons['alert'] !!}</svg>
        </div>
        <div class="code">ERROR {{ $code }}</div>
        <h1>{{ $title }}</h1>
        <p>{{ $message }}</p>

        <div class="actions">
            @if ($retry)
                <button type="button" class="btn btn-primary" onclick="window.location.reload()">{{ $retryLabel }}</button>
                <a href="/" class="btn">Go to home</a>
            @else
                <a href="/" class="btn btn-primary">Go to home</a>
                <button type="button" class="btn" onclick="history.length > 1 ? history.back() : (window.location.href = '/')">Go back</button>
            @endif
        </div>
    </main>

    <div class="foot">&copy; {{ date('Y') }} {{ config('app.name', 'Blinds Town') }}</div>
</body>
</html>
