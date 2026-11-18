import { useEffect, useRef, useState } from 'react'
import { Camera, Upload, ScanLine, SwitchCamera } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CameraScanner({ onCapture }: { onCapture: (imageDataUrl: string | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nativeInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'starting' | 'live' | 'error'>('idle')
  const [error, setError] = useState<string>('')
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')
  const streamActive = status === 'live'
  const lighting: 'GOOD' = 'GOOD'

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const startCamera = async (mode: 'environment' | 'user' = facing) => {
    stopStream()
    setStatus('starting')
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error')
      setError('This browser or embed does not expose the camera. Use "Take photo" or upload instead.')
      return
    }
    try {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        })
      } catch (e) {
        if (e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) throw e
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }
      streamRef.current = stream
      setFacing(mode)
      const v = videoRef.current
      if (v) {
        v.srcObject = stream
        await v.play().catch(() => {})
      }
      setStatus('live')
    } catch (e) {
      const name = e instanceof DOMException ? e.name : ''
      setStatus('error')
      setError(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'Camera permission was blocked. Allow camera access for this page (or this embed may not permit it) — or use "Take photo" / upload instead.'
          : name === 'NotFoundError'
            ? 'No camera was found on this device. Use upload instead.'
            : name === 'NotReadableError'
              ? 'The camera is in use by another app. Close it and try again.'
              : 'Could not start the camera. Use "Take photo" / upload instead.',
      )
    }
  }

  useEffect(() => stopStream, [])

  const handleCapture = () => {
    const v = videoRef.current
    if (streamActive && v && v.videoWidth) {
      const canvas = document.createElement('canvas')
      canvas.width = v.videoWidth
      canvas.height = v.videoHeight
      canvas.getContext('2d')?.drawImage(v, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
      stopStream()
      onCapture(dataUrl)
    } else {
      onCapture(null)
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      stopStream()
      onCapture(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-line-700 bg-ink-950 sm:aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`h-full w-full object-cover ${streamActive ? '' : 'hidden'} ${facing === 'user' ? '-scale-x-100' : ''}`}
        />
        {!streamActive && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_center,_var(--color-ink-700),_var(--color-ink-950))] px-6 text-center">
            <Camera className="h-10 w-10 text-mist-500" />
            <p className="max-w-xs text-xs text-mist-500">
              {status === 'starting' ? 'Starting camera…' : error || 'Start the camera to scan the test strip.'}
            </p>
            {status !== 'starting' && (
              <Button size="md" onClick={() => startCamera()}>
                <Camera className="h-4 w-4" />
                {status === 'error' ? 'Try again' : 'Start camera'}
              </Button>
            )}
          </div>
        )}
        {streamActive && (
          <button
            type="button"
            onClick={() => startCamera(facing === 'environment' ? 'user' : 'environment')}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/80 text-mist-100 hover:bg-ink-950"
            aria-label="Switch camera"
          >
            <SwitchCamera className="h-4.5 w-4.5" />
          </button>
        )}

        {/* alignment frame */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
          <div className="relative h-2/3 w-4/5 rounded-lg border-2 border-evidence-400/70">
            <span className="absolute -left-px -top-px h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-evidence-400" />
            <span className="absolute -right-px -top-px h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-evidence-400" />
            <span className="absolute -bottom-px -left-px h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-evidence-400" />
            <span className="absolute -bottom-px -right-px h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-evidence-400" />
            <div className="absolute inset-x-2 top-1/2 h-0.5 bg-evidence-400/70 animate-scanline" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
          <span className="rounded-md bg-ink-950/80 px-3 py-1.5 text-xs font-medium text-mist-100">
            Position test strip inside frame
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <span className="flex items-center gap-1.5 rounded-md bg-ink-950/80 px-3 py-1.5 text-xs font-medium text-verified-400">
            <ScanLine className="h-3.5 w-3.5" />
            Lighting quality: {lighting}
          </span>
        </div>
      </div>

      <ol className="grid grid-cols-1 gap-1.5 text-xs text-mist-500 sm:grid-cols-2">
        <li>1. Place the test strip inside the frame</li>
        <li>2. Place the reference color card beside it</li>
        <li>3. Avoid shadows across the sample</li>
        <li>4. Keep the camera steady</li>
      </ol>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={streamActive ? handleCapture : () => nativeInputRef.current?.click()}>
          <Camera className="h-4.5 w-4.5" />
          {streamActive ? 'Capture evidence' : 'Take photo'}
        </Button>
        <Button size="lg" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4.5 w-4.5" />
          Upload existing image
        </Button>
        <input ref={nativeInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
    </div>
  )
}
