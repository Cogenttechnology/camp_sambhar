import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-blush">
      <div className="container-page text-center">
        <p className="eyebrow mb-3">Lost in the salt flats</p>
        <h1 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)]">
          This page has wandered off
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          The trail you followed doesn’t lead anywhere. Let’s get you back to camp.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-red-500 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-red-600"
        >
          Return home
        </Link>
      </div>
    </section>
  )
}
