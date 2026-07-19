import type { Metadata } from 'next'
import { getSiteSettings } from '../../../lib/queries'
import { buildMetadata } from '../../../lib/seo'
import { PageHero } from '../../../components/layout/PageHero'
import { ArtAccent, PaperTexture, TopoPattern } from '../../../components/ui/Nature'
import { EnquiryForm } from '../../../components/EnquiryForm'
import { whatsappLink } from '../../../lib/utils'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(
    {
      title: 'Contact & Enquire',
      description: 'Plan your stay at Camp Sambhar. Call, WhatsApp, or send an enquiry and we’ll craft the rest.',
      path: '/contact',
    },
    settings,
  )
}

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const wa = whatsappLink(settings.whatsappNumber, 'Hello Camp Sambhar! I’d like to plan a stay.')

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Plan your Sambhar escape"
        intro="Tell us your dates and what draws you here — we’ll take care of the rest."
        art="camel"
      />

      <section className="relative overflow-hidden bg-ivory py-[var(--spacing-section)]">
        <PaperTexture opacity={0.35} />
        <TopoPattern opacity={0.05} />
        <ArtAccent art="flamingo" className="-left-8 bottom-16 hidden w-40 lg:block" opacity={0.3} />
        <div className="container-page relative grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <h2 className="font-[family-name:var(--font-serif)] text-2xl">Reach us directly</h2>
            <dl className="mt-6 space-y-5 text-sm">
              {settings.phone ? (
                <div>
                  <dt className="text-muted">Phone</dt>
                  <dd>
                    <a href={`tel:${settings.phone}`} className="text-charcoal hover:text-red-600">
                      {settings.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.email ? (
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd>
                    <a href={`mailto:${settings.email}`} className="text-charcoal hover:text-red-600">
                      {settings.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.address ? (
                <div>
                  <dt className="text-muted">Address</dt>
                  <dd className="whitespace-pre-line text-charcoal">{settings.address}</dd>
                </div>
              ) : null}
              {settings.directions ? (
                <div>
                  <dt className="text-muted">Getting here</dt>
                  <dd className="text-charcoal">{settings.directions}</dd>
                </div>
              ) : null}
            </dl>

            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm text-white transition-colors hover:bg-sage-600"
              >
                Chat on WhatsApp
              </a>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <EnquiryForm sourcePage="/contact" />
          </div>
        </div>

        {settings.mapEmbedUrl ? (
          <div className="container-page mt-14">
            <div className="aspect-[16/7] overflow-hidden rounded-2xl">
              <iframe
                src={settings.mapEmbedUrl}
                title="Camp Sambhar location"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        ) : null}
      </section>
    </>
  )
}
