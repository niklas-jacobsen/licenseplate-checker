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
import { TEMPLATE_VARIABLES } from '@licenseplate-checker/shared/template-variables'
import LandingNav from '@/components/landing/landing-nav'
import WorkflowAnimation from '@/components/landing/workflow-animation'
import animationStyles from '@/components/landing/workflow-animation.module.css'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { euroPlate } from '@/lib/plate-font'

const steps = [
  {
    title: 'Create a check',
    body: "Enter the city, letters and numbers you'd like on your plate.",
  },
  {
    title: 'Build a workflow',
    body: "Drag nodes onto the canvas to describe the steps your city's reservation website needs.",
  },
  {
    title: 'Let it run',
    body: "It runs daily in a headless browser. You're told when your plate is available.",
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
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs font-medium text-gray-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Runs every day, automatically
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-[54px]">
              Get the plate you want the day it frees up.
            </h1>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              Build a workflow for your city's reservation website once.
              Licenseplate Checker runs it daily in a headless browser and tells
              you when your combination is available.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button size="lg" asChild>
                <Link href="/auth/register?redirect=/checks/new">Start a check</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>
            <div className="mt-7 flex max-w-[420px] items-center gap-3 rounded-lg border bg-white px-3 py-2.5">
              <span
                aria-hidden="true"
                className="flex h-[30px] shrink-0 overflow-hidden rounded border-[1.5px] border-black"
              >
                <span className="w-3 bg-blue-600" />
                <span
                  className={`${euroPlate.className} flex items-center gap-1.5 px-2 text-xl`}
                >
                  <span>HH</span>
                  <span>NJ</span>
                  <span>42</span>
                </span>
              </span>
              <span className="text-[13px] text-gray-600">
                Hamburg · next run tomorrow, 07:00
              </span>
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
              Every city's site is different. The builder handles that.
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Each node is one thing you'd do in the browser yourself. Your
              plate's values go in through template variables.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_VARIABLES.map((v) => (
              <code
                key={v.key}
                className="rounded-md bg-blue-50 px-2 py-1 font-mono text-xs text-blue-700"
              >
                {`{{ ${v.key} }}`}
              </code>
            ))}
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
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-neutral-900 p-8 text-neutral-50 md:p-10">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-[28px]">
              Which plate are you after?
            </h2>
            <p className="mt-1.5 text-[15px] text-neutral-400">
              Create a free account and start your first check.
            </p>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/register?redirect=/checks/new">Start a check</Link>
          </Button>
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
