import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTestimonials } from '@/data/testimonials';
import { SEO } from '@/components/SEO';

export default function TestimonialsPage() {
  const testimonials = getTestimonials();
  
  // Schema.org para Reviews (crucial para SEO y Featured Snippets)
  const reviewsSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Los que Madrugan - Suscripción de frases motivacionales",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": testimonials.length.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": testimonials.slice(0, 6).map(t => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": t.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": t.rating.toString(),
        "bestRating": "5"
      },
      "reviewBody": t.quote,
      "datePublished": t.date,
      "publisher": {
        "@type": "Organization",
        "name": "Los que Madrugan"
      }
    }))
  };

  return (
    <>
      <SEO 
        title="Testimonios | Lo que dicen nuestros suscriptores"
        description="+500 emprendedores colombianos transformaron sus mañanas con Los que Madrugan. Leé sus historias reales de éxito."
        pathname="/testimonios"
      />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(reviewsSchema)}
      </script>

      <div className="min-h-screen bg-[#0B0F17]">
        {/* Header */}
        <header className="border-b border-white/5 px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl">🌅</span>
              <span className="font-bold text-white">
                Los que <span className="text-amber-400">Madrugan</span>
              </span>
            </a>
            <a href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Rating Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="text-amber-400 font-semibold">4.9/5</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{testimonials.length}+ reseñas</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Lo que dicen los que <span className="text-amber-400">madrugan</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Historias reales de emprendedores colombianos que transformaron sus mañanas 
                y sus negocios con nuestras frases diarias.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { value: "500+", label: "Emprendedores" },
                { value: "4.9/5", label: "Rating promedio" },
                { value: "12", label: "Ciudades de Colombia" },
                { value: "87%", label: "Renovación mensual" }
              ].map((stat, i) => (
                <div key={i} className="glass rounded-2xl p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-amber-400">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.article
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl p-6 flex flex-col"
                >
                  {/* Quote Icon */}
                  <Quote className="h-8 w-8 text-amber-500/30 mb-4" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-300 mb-4 flex-grow leading-relaxed">
                    "{testimonial.quote}"
                  </p>

                  {/* Results Badge */}
                  {testimonial.results && (
                    <div className="mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <p className="text-emerald-400 text-sm font-medium">
                        ✅ {testimonial.results}
                      </p>
                    </div>
                  )}

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-500 text-sm">{testimonial.role}</p>
                      <p className="text-gray-500 text-xs">{testimonial.business}</p>
                      <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                        <MapPin className="h-3 w-3" />
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Video Testimonials Placeholder */}
        <section className="px-4 py-12 border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Video testimonios próximamente
            </h2>
            <p className="text-gray-400">
              Estamos grabando historias reales de nuestros suscriptores.
              Si querés compartir tu experiencia, escribinos a hola@losquemadrugan.co
            </p>
          </div>
        </section>

        {/* CTA Final */}
        <section className="px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-strong rounded-3xl p-8 md:p-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para ser el próximo testimonio?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Unite a cientos de emprendedores colombianos que ya transformaron 
                sus mañanas. Probá 3 días gratis.
              </p>
              <a href="/empezar">
                <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-full px-10 py-6 glow-amber">
                  Empezar mi trial gratis
                </Button>
              </a>
              <p className="text-gray-500 text-sm mt-4">
                Sin tarjeta de crédito • Cancelá cuando quieras
              </p>
            </motion.div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="px-4 py-8 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
              <span className="text-gray-500">Pagos seguros vía</span>
              <span className="text-white font-semibold">Wompi</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">100% Colombiano</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">Soporte real 24/7</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
