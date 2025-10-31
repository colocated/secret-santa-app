export function ChristmasDecorations() {
  return (
    <>
      {/* Top stripe decoration */}
      <div className="christmas-stripe fixed left-0 right-0 top-0 z-40 h-3" />

      {/* Corner decorations - smaller on mobile */}
      <div className="pointer-events-none fixed left-2 top-16 z-30 text-4xl opacity-80 sm:left-4 sm:top-8 sm:text-6xl md:left-6">
        🎄
      </div>
      <div className="pointer-events-none fixed right-2 top-16 z-30 text-4xl opacity-80 sm:right-4 sm:top-8 sm:text-6xl md:right-6">
        🎄
      </div>

      {/* Ornament decorations - hidden on mobile to avoid overlap */}
      <div className="pointer-events-none fixed left-16 top-28 z-30 hidden text-4xl opacity-70 sm:block md:left-20 md:top-24">
        🎁
      </div>
      <div className="pointer-events-none fixed right-16 top-28 z-30 hidden text-4xl opacity-70 sm:block md:right-20 md:top-24">
        🎁
      </div>

      {/* Bottom decorations - smaller on mobile */}
      <div className="pointer-events-none fixed bottom-4 left-2 z-30 text-3xl opacity-75 sm:bottom-8 sm:left-8 sm:text-5xl">
        ⛄
      </div>
      <div className="pointer-events-none fixed bottom-4 right-2 z-30 text-3xl opacity-75 sm:bottom-8 sm:right-8 sm:text-5xl">
        ⛄
      </div>
    </>
  )
}
