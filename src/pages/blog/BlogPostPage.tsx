import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPostBySlug } from '@/data/blog-posts';
import { BlogSEO } from '@/components/BlogSEO';
import { useParams } from 'react-router-dom';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Artículo no encontrado</h1>
          <p className="text-gray-400 mb-4">El artículo que buscás no existe.</p>
          <a href="/blog">
            <Button className="bg-amber-500 hover:bg-amber-400 text-black">
              Ver todos los artículos
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Convertir markdown simple a HTML básico
  const contentHtml = post.content
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl md:text-4xl font-bold text-white mt-8 mb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-amber-400 mt-8 mb-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-amber-500 pl-4 my-6 text-gray-300 italic">$1</blockquote>')
    .replace(/^- (.*$)/gim, '<li class="text-gray-300 ml-6 mb-2">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-gray-300 mb-4 leading-relaxed">')
    .replace(/^(?!<[h1-6li]|\<blockquote)(.*$)/gim, '<p class="text-gray-300 mb-4 leading-relaxed">$1</p>');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado al portapapeles');
    }
  };

  return (
    <>
      <BlogSEO 
        title={post.title}
        description={post.excerpt}
        pathname={`/blog/${post.slug}`}
        publishDate={post.publishDate}
        modifiedDate={post.modifiedDate}
        readingTime={post.readingTime}
        tags={post.tags}
      />
      
      <div className="min-h-screen bg-[#0B0F17]">
        {/* Header */}
        <header className="border-b border-white/5 px-4 py-4 sticky top-0 bg-[#0B0F17]/95 backdrop-blur-sm z-50">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl">🌅</span>
              <span className="font-bold text-white hidden sm:block">
                Los que <span className="text-amber-400">Madrugan</span>
              </span>
            </a>
            <div className="flex items-center gap-2">
              <a href="/blog">
                <Button variant="ghost" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Blog
                </Button>
              </a>
              <Button 
                variant="ghost" 
                className="text-gray-400 hover:text-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <article className="px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Meta info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishDate).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readingTime}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {post.title}
              </h1>
              
              <p className="text-xl text-gray-400">{post.excerpt}</p>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <h4 className="text-white font-semibold mb-3">Etiquetas:</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span 
                    key={tag}
                    className="text-sm px-3 py-1 bg-white/5 text-gray-400 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* CTA Final */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 glass rounded-2xl p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                ¿Te gustó este artículo?
              </h3>
              <p className="text-gray-400 mb-6">
                Recibí contenido como este + frases motivacionales cada mañana a las 6 AM.
              </p>
              <a href="/empezar">
                <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full px-8 py-6">
                  Probar 3 días gratis
                </Button>
              </a>
            </motion.div>

            {/* Related Posts */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12"
            >
              <h4 className="text-white font-semibold mb-4">Artículos relacionados:</h4>
              <div className="grid gap-4">
                <a 
                  href="/blog/habitos-emprendedores-exitosos-colombia"
                  className="block p-4 glass rounded-xl hover:border-amber-500/30 transition-colors"
                >
                  <h5 className="text-white font-medium">7 Hábitos de Emprendedores Exitosos en Colombia</h5>
                </a>
                <a 
                  href="/blog/por-que-6am-hora-oro-emprendedores"
                  className="block p-4 glass rounded-xl hover:border-amber-500/30 transition-colors"
                >
                  <h5 className="text-white font-medium">Por Qué las 6 AM son la Hora de Oro para Emprendedores</h5>
                </a>
              </div>
            </motion.div>
          </div>
        </article>
      </div>
    </>
  );
}
