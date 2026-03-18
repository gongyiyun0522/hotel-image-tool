import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '酒店图片工坊 - 在线图片处理工具',
  description: '为酒店从业者提供快速、免费的图片在线处理工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
