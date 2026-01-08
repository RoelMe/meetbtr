"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Check, Star, ArrowRight, Zap, Sidebar, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/new');
    };

    return (
        <div className="min-h-screen flex flex-col">


            {/* --- Hero Section --- */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/50 via-background to-background dark:from-zinc-900/20"></div>
                <div className="container mx-auto px-4 flex flex-col items-center text-center">
                    <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 mb-8 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300">
                        <span className="flex h-2 w-2 rounded-full bg-gray-600 mr-2 animate-pulse"></span>
                        v2.0 is now live
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6 leading-[1.1]">
                        Most meetings suck. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-700 to-slate-500">Meet better with meetbtr.</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                        The highly-functional, premium meeting manager designed for teams who value their time.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                        <Button size="lg" onClick={handleGetStarted} className="h-12 text-base rounded-xl shadow-lg shadow-slate-500/20 bg-slate-900 hover:bg-slate-800 text-white">
                            Start Meeting Better Now <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 text-base rounded-xl bg-background/50 backdrop-blur-sm border-border">
                            View Demo
                        </Button>
                    </div>

                    {/* Reviews / Social Proof Microcopy */}
                    <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gray-200 flex items-center justify-center text-[10px] font-bold overflow-hidden relative">
                                    <Image
                                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i * 123}`}
                                        alt="Avatar"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                            </div>
                            <span className="text-xs font-medium">Loved by 2,000+ successful executives</span>
                        </div>
                    </div>

                    {/* Hero Image Placeholder */}
                    <div className="mt-16 w-full max-w-5xl rounded-2xl border border-border shadow-2xl bg-card p-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-20"></div>
                        <div className="aspect-video bg-gray-50/50 dark:bg-zinc-900/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                            {/* Abstract UI Representation */}
                            <div className="absolute top-10 left-10 right-10 bottom-0 bg-background rounded-t-xl border border-border shadow-sm p-6">
                                <div className="flex gap-8 h-full">
                                    {/* Sidebar Mock */}
                                    <div className="w-48 hidden md:flex flex-col gap-4 border-r border-border/50 pr-6">
                                        <div className="h-8 w-8 bg-slate-600 rounded-lg mb-4"></div>
                                        <div className="h-2 w-24 bg-gray-100 rounded"></div>
                                        <div className="h-2 w-20 bg-gray-100 rounded"></div>
                                        <div className="h-2 w-28 bg-gray-100 rounded"></div>
                                    </div>
                                    {/* Main Content Mock */}
                                    <div className="flex-1 flex flex-col gap-6">
                                        <div className="flex justify-between items-center">
                                            <div className="h-8 w-48 bg-gray-100 rounded"></div>
                                            <div className="h-8 w-24 bg-slate-600 rounded"></div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1 h-32 bg-gray-50 border border-border rounded-xl"></div>
                                            <div className="flex-1 h-32 bg-gray-50 border border-border rounded-xl"></div>
                                            <div className="flex-1 h-32 bg-gray-50 border border-border rounded-xl"></div>
                                        </div>
                                        <div className="flex-1 bg-gray-50 border border-border rounded-xl"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Social Proof (Logos) --- */}
            <section className="py-12 border-y border-border/40 bg-background/50">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Trusted by innovative teams at</p>
                    <div className="w-full overflow-hidden">
                        <div className="flex w-max animate-scroll gap-20 items-center">
                            {/* Duplicate items for seamless loop */}
                            {[...['Acme Corp', 'Linear', 'Vercel', 'Notion', 'Raycast'], ...['Acme Corp', 'Linear', 'Vercel', 'Notion', 'Raycast']].map((brand, i) => (
                                <span key={`${brand}-${i}`} className="text-xl font-bold font-mono text-foreground opacity-50 grayscale hover:grayscale-0 transition-all duration-500 shrink-0">{brand}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Benefits Section --- */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">The Functional Premium.</h2>
                        <p className="text-lg text-muted-foreground">
                            Agendar sits at the intersection of utility and approachability. It feels like a high-precision tool for professionals.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: "Focused",
                                description: "Built for collaboration. Dynamically updating agendas, restricted access, and smart action managmement.",
                                color: "text-gray-500",
                                bg: "bg-gray-500/10"
                            },
                            {
                                icon: Sidebar,
                                title: "Airy & Refined",
                                description: "A border-first design system that breathes. Reduced eye strain with carefully calibrated contrast.",
                                color: "text-gray-500",
                                bg: "bg-gray-500/10"
                            },
                            {
                                icon: Clock,
                                title: "Responsive",
                                description: "Your agenda adapts to you. Whether on desktop or mobile, your data is always perfectly presented.",
                                color: "text-emerald-500",
                                bg: "bg-emerald-500/10"
                            }
                        ].map((benefit, i) => (
                            <Card key={i} className="group border border-gray-100 shadow-none hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                                <CardContent className="p-8">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6", benefit.bg, benefit.color)}>
                                        <benefit.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Button size="lg" onClick={handleGetStarted} className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-slate-500/20 bg-slate-900 hover:bg-slate-800 text-white">
                            Build Your First Agenda
                        </Button>
                    </div>
                </div>
            </section>

            {/* --- Testimonials --- */}
            <section className="py-24 bg-secondary/30 border-y border-border">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">Don't just take our word for it.</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "Finally, a meeting tool that doesn't feel like enterprise bloatware. It's snappy and beautiful.",
                                author: "Alex R.",
                                role: "Product Manager"
                            },
                            {
                                quote: "The 'Functional Premium' philosophy really shines through. It's a joy to use every day.",
                                author: "Sarah K.",
                                role: "Engineering Lead"
                            },
                            {
                                quote: "I've tried them all. Agendar is the only one that actually helps me stick to the agenda.",
                                author: "James L.",
                                role: "Founder"
                            }
                        ].map((t, i) => (
                            <Card key={i} className="bg-background border-none shadow-sm p-6">
                                <div className="flex gap-1 mb-4 text-amber-400">
                                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-lg font-medium mb-6">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-sm">
                                        {t.author[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{t.author}</div>
                                        <div className="text-xs text-muted-foreground">{t.role}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FAQ Section --- */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        {[
                            { q: "Is meetbtr free?", a: "Yes! We have a generous free tier for individuals and small teams to get started immediately." },
                            { q: "Does it sync with Google Calendar?", a: "Currently we support manual input, but Google Calendar integration is on our immediate roadmap." },
                            { q: "Can I use it for recurring meetings?", a: "Absolutely. You can create templates and duplicate agendas for your recurring standups and syncs." },
                            { q: "How secure is my data?", a: "We use enterprise-grade encryption provided by Firebase and Google Cloud Platform. Your data is safe with us." }
                        ].map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`}>
                                <AccordionTrigger className="text-lg font-semibold">{faq.q}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* --- Final CTA --- */}
            <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 to-transparent"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to run better meetings?</h2>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Join thousands of high-performing teams who have switched to the functional premium way of working.
                    </p>
                    <Button size="lg" onClick={handleGetStarted} className="h-14 px-10 rounded-xl text-lg font-bold bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all duration-300">
                        Get Started for Free
                    </Button>
                    <p className="mt-6 text-sm text-slate-500">No credit card required. Cancel anytime.</p>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-12 border-t border-border bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <Image
                                    src="/meetmate.png"
                                    alt="Logo"
                                    width={24}
                                    height={24}
                                    className="rounded-md"
                                />
                                <span className="font-black italic text-lg">meetbtr</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Making every minute count with functional, premium tools for thought.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Features</a></li>
                                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                                <li><a href="#" className="hover:text-foreground">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">About</a></li>
                                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Meetbtr Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
