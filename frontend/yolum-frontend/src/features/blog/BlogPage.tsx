import { useEffect, useState } from 'react'
import { blogApi } from '@/services/api/endpoints'
import type { BlogPost } from '@/types'
import { BlogCard } from '@/components/shared/BlogCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import podcastIllustration from '@/assets/illustrations/podcast-illustration.png'

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null)

  useEffect(() => {
    blogApi.list().then(setPosts)
  }, [])

  const blogPosts = posts?.filter((p) => p.kind === 'blog') ?? []
  const podcastPosts = posts?.filter((p) => p.kind === 'podcast') ?? []
  const featured = blogPosts[0]

  return (
    <div className="container max-w-6xl py-6 sm:py-10">
      <div className="mb-10 grid items-center gap-8 rounded-2xl bg-gradient-to-br from-primary-50 to-white p-8 sm:grid-cols-[1fr_auto] sm:p-12">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">Öyrən, İlham al, İnkişaf et!</h1>
          <p className="mt-2 max-w-lg text-sm text-ink-600 sm:text-base">
            Texnologiya, proqramlaşdırma və karyera haqqında məqalələr və podcastlər ilə biliklərini artır.
          </p>
        </div>
        <img src={podcastIllustration} alt="" className="w-28 justify-self-center sm:w-36" />
      </div>

      {!posts && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      )}

      {posts && (
        <Tabs defaultValue="blog">
          <TabsList>
            <TabsTrigger value="blog">Bloq</TabsTrigger>
            <TabsTrigger value="podcast">Podcast</TabsTrigger>
          </TabsList>

          <TabsContent value="blog">
            {featured && <BlogCard post={featured} featured className="mb-6" />}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.slice(1).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            {blogPosts.length === 0 && <EmptyState title="Hələ məqalə yoxdur" />}
          </TabsContent>

          <TabsContent value="podcast">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {podcastPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            {podcastPosts.length === 0 && <EmptyState title="Hələ podcast epizodu yoxdur" />}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
