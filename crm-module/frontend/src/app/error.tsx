'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="panel" role="alert"><h1>Unable to open this page</h1><p>Retry to reload the workspace.</p><button className="button" onClick={reset}>Retry</button></section>; }
