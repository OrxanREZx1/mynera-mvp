import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eye, Heart, Share2 } from 'lucide-react'
import { blogApi } from '@/services/api/endpoints'
import type { BlogPost } from '@/types'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { blogPosts } from '@/services/api/mockData'
import { BlogCard } from '@/components/shared/BlogCard'

export default function BlogArticlePage() {
  const { postId } = useParams()
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (!postId) return
    blogApi.byId(postId).then((p) => setPost(p ?? null))
  }, [postId])

  if (post === undefined) {
    return (
      <div className="container max-w-3xl py-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-4 h-72 rounded-lg" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container max-w-3xl py-8 text-center">
        <p className="text-ink-600">Bu məqalə tapılmadı.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/blog">Bloqa qayıt</Link>
        </Button>
      </div>
    )
  }

  const related = blogPosts.filter((p) => p.id !== post.id).slice(0, 2)

  return (
    <div className="pb-16">
      <MobilePageHeader title={post.kind === 'podcast' ? 'Podcast' : 'Bloq'} />

      <article className="container max-w-3xl py-6 sm:py-10">
        <Badge className="mb-4">{post.category}</Badge>
        <h1 className="text-2xl font-semibold leading-tight text-ink-900 sm:text-3xl">{post.title}</h1>

        <div className="mt-5 flex items-center gap-3">
          <img src={post.authorAvatarUrl} alt="" className="size-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-medium text-ink-800">{post.authorName}</p>
            <p className="text-xs text-ink-500">{post.authorTitle}</p>
          </div>
        </div>

        <img src={post.coverUrl} alt="" className="my-6 aspect-video w-full rounded-xl object-cover" />

        <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-ink-700">
          {post.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-y border-ink-100 py-4">
          <span className="text-sm text-ink-400">{post.date}</span>
          <div className="flex items-center gap-4 text-sm text-ink-500">
            <button
              onClick={() => setLiked((v) => !v)}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-danger-500"
            >
              <Heart className={liked ? 'size-4 fill-danger-500 text-danger-500' : 'size-4'} />
              {post.likes + (liked ? 1 : 0)}
            </button>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4" /> {post.views}
            </span>
            <button className="inline-flex items-center gap-1.5 transition-colors hover:text-primary-600">
              <Share2 className="size-4" /> Paylaş
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-ink-900">Bunları da bəyənə bilərsən</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {related.map((r) => (
                <BlogCard key={r.id} post={r} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
