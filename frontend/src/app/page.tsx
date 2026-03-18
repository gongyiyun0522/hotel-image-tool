'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [tool, setTool] = useState<string>('crop')
  const [cropPreset, setCropPreset] = useState<string>('free')
  const [resizeWidth, setResizeWidth] = useState<number>(800)
  const [resizeHeight, setResizeHeight] = useState<number>(600)
  const [resizePercent, setResizePercent] = useState<number>(50)
  const [compressQuality, setCompressQuality] = useState<number>(80)
  const [convertFormat, setConvertFormat] = useState<string>('jpeg')
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImageClient = (
    imgData: string,
    operation: string,
    params: any
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas not supported'))
            return
          }

          let { width, height } = img
          let x = 0, y = 0

          if (operation === 'crop') {
            x = params.x || 0
            y = params.y || 0
            width = params.width || img.width
            height = params.height || img.height
            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height)
          } else if (operation === 'resize') {
            if (params.percent) {
              width = Math.round(img.width * params.percent / 100)
              height = Math.round(img.height * params.percent / 100)
            } else {
              width = params.width || img.width
              height = params.height || img.height
            }
            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)
          } else if (operation === 'rotate') {
            if (params.angle) {
              const angle = (params.angle * Math.PI) / 180
              if (Math.abs(params.angle) === 90 || Math.abs(params.angle) === 270) {
                canvas.width = height
                canvas.height = width
              } else {
                canvas.width = width
                canvas.height = height
              }
              ctx.translate(canvas.width / 2, canvas.height / 2)
              ctx.rotate(angle)
              ctx.drawImage(img, -img.width / 2, -img.height / 2)
            } else if (params.flip) {
              canvas.width = width
              canvas.height = height
              if (params.flip === 'horizontal') {
                ctx.translate(width, 0)
                ctx.scale(-1, 1)
              } else {
                ctx.translate(0, height)
                ctx.scale(1, -1)
              }
              ctx.drawImage(img, 0, 0)
            }
          } else if (operation === 'compress') {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            const quality = (params.quality || 80) / 100
            const mimeType = imgData.match(/^data:([^;]+);/)?.[1] || 'image/jpeg'
            resolve(canvas.toDataURL(mimeType, quality))
            return
          } else if (operation === 'convert') {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            const format = params.format || 'jpeg'
            const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg'
            resolve(canvas.toDataURL(mimeType, 0.92))
            return
          } else {
            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0)
          }

          resolve(canvas.toDataURL('image/jpeg', 0.92))
        } catch (e) {
          reject(e)
        }
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imgData
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setProcessedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setProcessedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCrop = async () => {
    if (!image) return
    setIsProcessing(true)
    try {
      const img = new window.Image()
      img.src = image
      await new Promise(r => (img.onload = r))
      
      const presets: Record<string, { width: number; height: number }> = {
        '16:9': { width: 16, height: 9 },
        '4:3': { width: 4, height: 3 },
        '1:1': { width: 1, height: 1 },
        '2:3': { width: 2, height: 3 }
      }
      
      const preset = presets[cropPreset]
      
      if (preset) {
        const imgRatio = img.width / img.height
        const presetRatio = preset.width / preset.height
        
        let targetWidth, targetHeight
        
        if (imgRatio > presetRatio) {
          targetHeight = img.height
          targetWidth = targetHeight * presetRatio
        } else {
          targetWidth = img.width
          targetHeight = targetWidth / presetRatio
        }
        
        const px = (img.width - targetWidth) / 2
        const py = (img.height - targetHeight) / 2
        
        const result = await processImageClient(image, 'crop', {
          x: px, y: py, width: targetWidth, height: targetHeight
        })
        setProcessedImage(result)
      } else {
        setProcessedImage(image)
      }
    } catch {
      alert('处理失败，请重试')
    }
    setIsProcessing(false)
  }

  const handleResize = async () => {
    if (!image) return
    setIsProcessing(true)
    try {
      const result = await processImageClient(image, 'resize', { 
        width: resizeWidth, 
        height: resizeHeight 
      })
      setProcessedImage(result)
    } catch {
      alert('处理失败，请重试')
    }
    setIsProcessing(false)
  }

  const handleResizePercent = async () => {
    if (!image) return
    setIsProcessing(true)
    try {
      const result = await processImageClient(image, 'resize', { 
        percent: resizePercent 
      })
      setProcessedImage(result)
    } catch {
      alert('处理失败，请重试')
    }
    setIsProcessing(false)
  }

  const handleRotate = async (degrees: number) => {
    if (!image) return
    setIsProcessing(true)
    try {
      const result = await processImageClient(image, 'rotate', { angle: degrees })
      setProcessedImage(result)
    } catch {
      alert('处理失败，请重试')
    }
    setIsProcessing(false)
  }

  const handleFlip = async (direction: 'horizontal' | 'vertical') => {
    if (!image) return
    setIsProcessing(true)
    try {
      const result = await processImageClient(image, 'rotate', { flip: direction })
      setProcessedImage(result)
    } catch {
      alert('处理失败，请重试')
    }
    setIsProcessing(false)
  }

  const handleCompress = async () => {
    if (!image) return
    setIsProcessing(true)
    try {
      const result = await processImageClient(image, 'compress', { 
        quality: compressQuality 
      })
      setProcessedImage(result)
    } catch {
      alert('处理失败，请重试')
    }
    setIsProcessing(false)
  }

  const handleConvert = async () => {
    if (!image) return
    setIsProcessing(true)
    try {
      const result = await processImageClient(image, 'convert', { 
        format: convertFormat 
      })
      setProcessedImage(result)
    } catch {
      alert('处理失败，请重试')
    }
    setIsProcessing(false)
  }

  const handleAIEnhance = async () => {
    alert('AI 增强功能即将上线！')
  }

  const handleDownload = () => {
    const imgToDownload = processedImage || image
    if (!imgToDownload) return
    
    const link = document.createElement('a')
    const ext = convertFormat === 'jpeg' ? 'jpg' : convertFormat
    link.download = `hotel-image-${Date.now()}.${ext}`
    link.href = imgToDownload
    link.click()
  }

  const displayImage = processedImage || image

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">🏨 酒店图片工坊</h1>
          <p className="text-sm text-gray-500">在线图片处理工具</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!image && (
          <div
            className={`upload-area rounded-xl p-12 text-center cursor-pointer ${isDragging ? 'dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          >
            <div className="text-6xl mb-4">📤</div>
            <p className="text-lg text-gray-600 mb-2">点击或拖拽上传图片</p>
            <p className="text-sm text-gray-400">支持 JPG、PNG、WebP 格式，最大 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {image && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold mb-3">选择工具</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'crop', icon: '✂️', label: '裁剪' },
                    { id: 'resize', icon: '📐', label: '尺寸' },
                    { id: 'rotate', icon: '🔄', label: '旋转' },
                    { id: 'compress', icon: '📦', label: '压缩' },
                    { id: 'convert', icon: '🔁', label: '格式' },
                    { id: 'ai', icon: '🤖', label: 'AI 增强' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTool(t.id)}
                      className={`p-3 rounded-lg text-center transition-all ${
                        tool === t.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-2xl mb-1">{t.icon}</div>
                      <div className="text-sm">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                {tool === 'crop' && (
                  <>
                    <h3 className="font-semibold mb-3">裁剪比例</h3>
                    <select
                      value={cropPreset}
                      onChange={(e) => setCropPreset(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="free">自由裁剪</option>
                      <option value="16:9">16:9 宽屏</option>
                      <option value="4:3">4:3 标准</option>
                      <option value="1:1">1:1 方形</option>
                      <option value="2:3">2:3 竖版</option>
                    </select>
                    <button
                      onClick={handleCrop}
                      disabled={isProcessing}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isProcessing ? '处理中...' : '应用裁剪'}
                    </button>
                  </>
                )}

                {tool === 'resize' && (
                  <>
                    <h3 className="font-semibold mb-3">调整尺寸</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">宽度</label>
                        <input
                          type="number"
                          value={resizeWidth}
                          onChange={(e) => setResizeWidth(Number(e.target.value))}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">高度</label>
                        <input
                          type="number"
                          value={resizeHeight}
                          onChange={(e) => setResizeHeight(Number(e.target.value))}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleResize}
                      disabled={isProcessing}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isProcessing ? '处理中...' : '调整尺寸'}
                    </button>
                    <hr className="my-3" />
                    <div>
                      <label className="text-sm text-gray-600">缩放比例: {resizePercent}%</label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={resizePercent}
                        onChange={(e) => setResizePercent(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <button
                      onClick={handleResizePercent}
                      disabled={isProcessing}
                      className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      按比例缩放
                    </button>
                  </>
                )}

                {tool === 'rotate' && (
                  <>
                    <h3 className="font-semibold mb-3">旋转/翻转</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleRotate(-90)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        ↺ 左转 90°
                      </button>
                      <button onClick={() => handleRotate(90)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        ↻ 右转 90°
                      </button>
                      <button onClick={() => handleFlip('horizontal')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        ↔ 水平翻转
                      </button>
                      <button onClick={() => handleFlip('vertical')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        ↕ 垂直翻转
                      </button>
                    </div>
                  </>
                )}

                {tool === 'compress' && (
                  <>
                    <h3 className="font-semibold mb-3">图片压缩</h3>
                    <div>
                      <label className="text-sm text-gray-600">质量: {compressQuality}%</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={compressQuality}
                        onChange={(e) => setCompressQuality(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <button
                      onClick={handleCompress}
                      disabled={isProcessing}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isProcessing ? '处理中...' : '压缩图片'}
                    </button>
                  </>
                )}

                {tool === 'convert' && (
                  <>
                    <h3 className="font-semibold mb-3">格式转换</h3>
                    <select
                      value={convertFormat}
                      onChange={(e) => setConvertFormat(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                    </select>
                    <button
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isProcessing ? '处理中...' : '转换格式'}
                    </button>
                  </>
                )}

                {tool === 'ai' && (
                  <>
                    <h3 className="font-semibold mb-3">AI 画质增强</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      使用 AI 技术智能提升图片清晰度和质量
                    </p>
                    <button
                      onClick={handleAIEnhance}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      🤖 AI 增强
                    </button>
                  </>
                )}
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
                <button
                  onClick={handleDownload}
                  disabled={!displayImage}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  📥 下载图片
                </button>
                <button
                  onClick={() => { setImage(null); setProcessedImage(null); }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  🗑️ 清空图片
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold mb-3">预览</h3>
                <div className="border rounded-lg overflow-hidden bg-gray-50 min-h-[400px] flex items-center justify-center">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt="Preview"
                      className="max-w-full max-h-[600px] object-contain"
                    />
                  ) : (
                    <p className="text-gray-400">暂无图片</p>
                  )}
                </div>
                {processedImage && (
                  <p className="text-sm text-green-600 mt-2 text-center">
                    ✅ 处理完成，已生成新图片
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
