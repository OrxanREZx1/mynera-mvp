import { Link } from 'react-router-dom'
import { Eye, Heart } from 'lucide-react'
import type { BlogPost } from '@/types'
import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
  className?: string
}

export function BlogCard({ post, featured, className }: BlogCardProps) {
  if (featured) {
    return (
      <Link
        to={`/blog/${post.id}`}
        className={cn(
          'group grid grid-cols-1 overflow-hidden rounded-lg border border-ink-100 bg-white shadow-card transition-all hover:shadow-card-hover sm:grid-cols-2',
          className
        )}
      >
        <div className="aspect-[16/10] overflow-hidden bg-ink-100 sm:aspect-auto">
          <img src={post.coverUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        </div>
        <div className="flex flex-col justify-center gap-3 p-6">
          <Badge className="w-fit">{post.category}</Badge>
          <h3 className="text-xl font-semibold leading-snug text-ink-900 sm:text-2xl">{post.title}</h3>
          <p className="line-clamp-3 text-sm text-ink-600">{post.excerpt}</p>
          <div className="flex items-center gap-3 pt-2">
            <img src={post.authorAvatarUrl} alt="" className="size-8 rounded-full object-cover" />
            <div className="text-sm">
              <p className="font-medium text-ink-800">{post.authorName}</p>
              <p className="text-xs text-ink-500">{post.authorTitle}</p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/blog/${post.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
        className
      )}
    >
      <div className="aspect-[16/9] overflow-hidden bg-ink-100">
        <img src={post.coverUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-center gap-2">
          <img src={post.authorAvatarUrl} alt="" className="size-6 rounded-full object-cover" />
          <div className="text-xs">
            <span className="font-medium text-ink-800">{post.authorName}</span>
            <span className="text-ink-400"> · {post.authorTitle}</span>
          </div>
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink-900">{post.title}</h3>
        <p className="line-clamp-2 text-sm text-ink-500">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-500">
          <span>{post.date}</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" /> {post.likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" /> {post.views}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
