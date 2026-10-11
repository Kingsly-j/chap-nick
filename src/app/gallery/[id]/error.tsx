'use client';
import Link from 'next/link';
export default function GalleryError({ reset }: { reset: () => void }) { return <main className="gallery-loading"><h1>This story could not be loaded.</h1><p>Please try again in a moment.</p><button onClick={reset}>Try again</button><Link href="/weddings">Back to the gallery</Link></main>; }