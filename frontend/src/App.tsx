import { useEffect, useState } from 'react'

const summary = [
  {
    title: 'Total Income',
    amount: 'S$4,500.00',
    color: 'text-emerald-600',
  },
  {
    title: 'Total Expenses',
    amount: 'S$2,780.00',
    color: 'text-rose-600',
  },
  {
    title: 'Net Balance',
    amount: 'S$1,720.00',
    color: 'text-violet-700',
  },
]

function App() {

const [apiStatus, setApiStatus] = useState('Checking...')

useEffect(() => {
  async function checkBackend() {
    try {
      const response = await fetch('/api/v1/health')

      if (!response.ok) {
        throw new Error('Backend unavailable')
      }

      const data: { status: string } = await response.json()

      setApiStatus(
        data.status === 'UP' ? 'Connected' : 'Unavailable'
      )
    } catch {
      setApiStatus('Disconnected')
    }
  }

  void checkBackend()
}, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <h1 className="text-2xl font-bold text-violet-700">
            FinanceFlow
          </h1>

          <span className="text-sm text-slate-500">
            Personal Finance Manager
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h2>
          <p className="mt-3 text-sm text-slate-500">
  Backend API: <span className="font-semibold">{apiStatus}</span>
</p>
          <p className="mt-2 text-slate-500">
            Welcome to FinanceFlow. Manage your finances
            in one place.
          </p>
        </section>

        <section
          aria-label="Financial summary"
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {summary.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {item.title}
              </p>

              <h3 className={`mt-2 text-3xl font-bold ${item.color}`}>
                {item.amount}
              </h3>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h3 className="text-xl font-semibold text-slate-800">
            Financial Analytics
          </h3>

          <p className="mt-3 text-slate-500">
            Charts, transactions, and budgets will appear here.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
