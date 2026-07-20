import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { ArrowDownToLine, Banknote, Clock3, TrendingUp, Wallet } from 'lucide-react'
import { mentorDashboardApi } from '@/services/api/endpoints'
import type { Transaction } from '@/types'
import { StatCard } from '@/components/shared/StatCard'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'

interface WeeklyPoint {
  day: string
  sessions: number
}

export default function MentorEarningsPage() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [weekly, setWeekly] = useState<WeeklyPoint[] | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    mentorDashboardApi.transactions().then(setTransactions)
    mentorDashboardApi.weeklyActivity().then(setWeekly)
  }, [])

  return (
    <div className="pb-16">
      <MobilePageHeader title="Qazanc" />
      <div className="container max-w-5xl py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="hidden text-2xl font-semibold text-ink-900 lg:block">Qazanc</h1>
          <p className="text-sm text-ink-500">Maliyyə vəziyyətini və ödənişləri izlə.</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Ümumi qazanc" value="₼2,500" trend="18% keçən aya görə" />
          <StatCard icon={Banknote} label="Bu ay" value="₼1,500" sub="40 sessiya" />
          <StatCard icon={Clock3} label="Gözləyən" value="₼40" sub="3 köçürmə" />
          <StatCard icon={ArrowDownToLine} label="Çıxarılan məbləğ" value="₼1,200" sub="Köçürülüb" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-ink-100 bg-white p-5 shadow-card lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-ink-900">Sessiya aktivliyi (7 gün)</h2>
            {!weekly ? (
              <Skeleton className="h-56 w-full rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weekly}>
                  <CartesianGrid vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="#A0A0A0" />
                  <Tooltip
                    cursor={{ fill: '#F3E8FA' }}
                    contentStyle={{ borderRadius: 10, border: '1px solid #EEEEEE', fontSize: 12 }}
                  />
                  <Bar dataKey="sessions" fill="#BC70DA" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <TrendingUp className="size-4 text-primary-500" />
              Mövcud balans
            </div>
            <p className="text-3xl font-semibold text-ink-900">₼2,500</p>
            <Button
              onClick={() =>
                toast({ variant: 'success', title: 'Sorğu göndərildi', description: 'Vəsait 2-3 iş günü ərzində köçürüləcək.' })
              }
            >
              Vəsaiti çıxart
            </Button>
            <p className="text-xs text-ink-400">Minimum çıxarış ₼50</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Son əməliyyatlar</h2>
          {!transactions && <Skeleton className="h-48 rounded-lg" />}
          {transactions && (
            <div className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-xs text-ink-400">
                    <th className="px-4 py-3 font-medium">Tələbə</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Sessiya</th>
                    <th className="px-4 py-3 font-medium">Tarix</th>
                    <th className="px-4 py-3 text-right font-medium">Ödəniş</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-ink-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={t.studentAvatarUrl} alt="" className="size-8 rounded-full object-cover" />
                          <div>
                            <p className="font-medium text-ink-800">{t.studentName}</p>
                            <p className="text-xs text-ink-400">{t.studentTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-ink-600 sm:table-cell">{t.sessionTitle}</td>
                      <td className="px-4 py-3 text-ink-500">{t.date}</td>
                      <td className="px-4 py-3 text-right font-medium text-ink-900">{t.amount}₼</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
