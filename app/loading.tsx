export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center eresclave-gradient">
      <div className="text-white text-center">
        <div
          className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Cargando...
          </span>
        </div>
        <p className="mt-4 text-lg">Cargando eresclave...</p>
      </div>
    </div>
  )
}
