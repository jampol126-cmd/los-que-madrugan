import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllPosts } from '@/data/blog-posts';
import { BlogPageSEO } from '@/components/BlogSEO';

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <>
      <BlogPageSEO 
        title="Blog para Emprendedores | Tips de Productividad y Motivación"
        description="Artículos prácticos para emprendedores colombianos. Aprendé a madrugar, mantener la motivación y hacer crecer tu negocio."
        pathname="/blog"
        publishDate="2025-03-01"
        tags={["emprendimiento", "productividad", "motivación", "Colombia"]}
      />
      
      <div className="min-h-screen bg-[#0B0F17]">
        {/* Header */}
        <header className="border-b border-white/5 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl">🌅</span>
              <span className="font-bold text-white">
                Los que <span className="text-amber-400">Madrugan</span>
              </span>
            </a>
            <a href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Blog para <span className="text-amber-400">Emprendedores</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Tips de productividad, motivación y crecimiento para dueños de negocios en Colombia.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-6 hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.publishDate).toLocaleDateString('es-CO', { 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readingTime} de lectura
                    </span>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    <a 
                      href={`/blog/${post.slug}`} 
                      className="hover:text-amber-400 transition-colors"
                    >
                      {post.title}
                    </a>
                  </h2>
                  
                  <p className="text-gray-400 mb-4">{post.excerpt}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 4).map(tag => (
                      <span 
                        key={tag}
                        className="text-xs px-2 py-1 bg-white/5 text-gray-500 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center glass rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                ¿Querés recibir frases motivacionales cada mañana?
              </h3>
              <p className="text-gray-400 mb-6">
                Unite a cientos de emprendedores colombianos que madrugan con propósito.
              </p>
              <a href="/empezar">
                <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full px-8">
                  Empezar trial gratis
                </Button>
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
