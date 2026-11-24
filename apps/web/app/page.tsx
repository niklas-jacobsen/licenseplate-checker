import Image from 'next/image'
import Link from 'next/link'
import {
  Clock,
  GitBranch,
  Globe,
  Keyboard,
  ListChecks,
  type LucideIcon,
  MousePointerClick,
} from 'lucide-react'
import LandingNav from '@/components/landing/landing-nav'
import WorkflowAnimation from '@/components/landing/workflow-animation'
import animationStyles from '@/components/landing/workflow-animation.module.css'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const steps = [
  {
    title: 'Create a request',
    body: 'Enter the city code, letters and numbers of the plate you want.',
  },
  {
    title: 'Pick or build a workflow',
    body: "A workflow is the sequence of steps the city's reservation site needs, built from nodes on a canvas.",
  },
  {
    title: 'Daily runs',
    body: 'The workflow runs once a day in a headless browser. Each result is logged under Requests.',
  },
]

const nodeTypes: { icon: LucideIcon; label: string; body: string }[] = [
  { icon: Globe, label: 'Open page', body: 'Load the reservation website' },
  { icon: ListChecks, label: 'Select option', body: 'Pick from a dropdown' },
  { icon: Keyboard, label: 'Type text', body: 'Fill a field' },
  { icon: MousePointerClick, label: 'Click', body: 'Press a button or link' },
  { icon: Clock, label: 'Wait', body: 'Give a slow page time' },
  { icon: GitBranch, label: 'Conditional', body: 'Branch on what the page shows' },
]

const footerLinks = [
  { href: 'https://docs.lp-checker.com', label: 'Docs' },
  { href: 'https://api.lp-checker.com/docs', label: 'API' },
  { href: 'https://github.com/niklas-jacobsen/licenseplate-checker', label: 'GitHub' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <LandingNav />

      <section className={cn('border-b', animationStyles.canvas)}>
        <div className="container mx-auto grid items-center gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_640px]">
          <div className="relative z-10 rounded-2xl bg-[#fafafa]/85 py-6 pr-6">
            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-[44px]">
              Automated availability checks for German license plates.
            </h1>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              Describe your city's reservation site as a workflow. Each request
              runs it once a day in a headless browser and records whether the
              plate is available.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button size="lg" asChild>
                <Link href="/auth/register?redirect=/checks/new">Create a request</Link>
              </Button>
            </div>
          </div>

          {/* drawn at a fixed 640px; shrink it to fit phones and tablets */}
          <div className="overflow-x-auto max-lg:[zoom:0.85] max-sm:[zoom:0.53]">
            <WorkflowAnimation />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-4 border-y bg-white">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-extrabold tracking-tight">How it works</h2>
          <ol className="mt-7 grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-xl border p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 font-bold text-blue-600">
                  {i + 1}
                </span>
                <h3 className="mt-3.5 text-[17px] font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="builder" className="container mx-auto scroll-mt-4 px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
              Workflow nodes
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Each node is one browser action. The plate's city, letters and
              numbers are filled in when the workflow runs.
            </p>
          </div>
        </div>
        <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nodeTypes.map(({ icon: Icon, label, body }) => (
            <li key={label} className="flex gap-3 rounded-lg border bg-white p-4">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-sm text-muted-foreground">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-6">
          <p className="text-[15px] text-muted-foreground">
            Requests and workflows are stored per account.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="https://docs.lp-checker.com">Read the docs</a>
            </Button>
            <Button asChild>
              <Link href="/auth/register?redirect=/checks/new">Sign up</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
          <Image src="/logotype.svg" alt="Licenseplate Checker" width={70} height={30} />
          <nav aria-label="Footer" className="flex flex-wrap gap-5">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  )
}
