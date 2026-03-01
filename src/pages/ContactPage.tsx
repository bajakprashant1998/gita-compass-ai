import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { toast } from 'sonner';
import {
  Mail,
  MapPin,
  Send,
  MessageCircle,
  HelpCircle,
  Twitter,
  Github,
  Heart,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email must be less than 255 characters'),
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
  message: z.string().trim().min(20, 'Message must be at least 20 characters').max(2000, 'Message must be less than 2000 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const faqs = [
  {
    question: 'What is Bhagavad Gita Gyan?',
    answer: 'Bhagavad Gita Gyan is a modern platform that makes the timeless wisdom of the Bhagavad Gita accessible to everyone. We provide AI-powered guidance, problem-based solutions, and easy-to-understand explanations of all 700+ verses.',
  },
  {
    question: 'How does the AI Gita Coach work?',
    answer: 'Our AI Gita Coach uses advanced language models to understand your questions and provide relevant wisdom from the Bhagavad Gita. It connects your modern-day problems with timeless solutions, offering personalized guidance based on the teachings.',
  },
  {
    question: 'Is this platform free to use?',
    answer: 'Yes! Our core features including reading all verses, exploring chapters, and getting AI guidance are completely free. We believe spiritual wisdom should be accessible to everyone.',
  },
  {
    question: 'How can I support this project?',
    answer: 'You can support us by donating, sharing with friends and family, providing feedback, or contributing to our mission of spreading Gita wisdom. Every bit of support helps us reach more seekers.',
  },
  {
    question: 'Can I request specific features?',
    answer: 'Absolutely! We love hearing from our community. Use the contact form to share your ideas, and we\'ll consider them for future updates. Your feedback shapes the future of this platform.',
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Message sent successfully! We\'ll get back to you soon. 🙏');
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <SEOHead
        title="Contact Us | Bhagavad Gita Gyan"
        description="Get in touch with the Bhagavad Gita Gyan team. We'd love to hear from you!"
      />

      {/* ========== PREMIUM HERO ========== */}
      <section className="relative overflow-hidden min-h-[45vh] flex items-center border-b border-border/50">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-background to-accent/6" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,hsl(var(--accent)/0.10),transparent_50%)]" />
          <div className="absolute top-[10%] left-[15%] w-96 h-96 rounded-full bg-primary/[0.04] blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-500/[0.04] blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Watermark */}
        <div className="absolute right-[-5%] top-[5%] text-[22rem] font-bold text-primary/[0.03] select-none pointer-events-none leading-none hidden lg:block" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ॐ</div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-8 animate-fade-in border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              We're Here to Help
              <MessageCircle className="h-4 w-4" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 animate-fade-in animation-delay-100 tracking-tight">
              <span className="text-foreground">Get in</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">touch.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
              Have questions, suggestions, or just want to connect? 
              Reach out and let's explore the path of wisdom together.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ========== CONTACT FORM & INFO ========== */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Contact Form — 7 cols */}
            <div className="lg:col-span-7 animate-fade-in">
              <div className="relative rounded-2xl border-2 border-border/50 bg-card overflow-hidden hover:border-primary/30 hover:shadow-2xl transition-all duration-300">
                <div className="h-1.5 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
                
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg">
                      <Send className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold">Send a Message</h2>
                      <p className="text-sm text-muted-foreground">We'll get back to you soon</p>
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">Your Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your name" className="h-12 bg-background/80 border-2 border-border focus:border-primary rounded-xl transition-all" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="your@email.com" className="h-12 bg-background/80 border-2 border-border focus:border-primary rounded-xl transition-all" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="What's this about?" className="h-12 bg-background/80 border-2 border-border focus:border-primary rounded-xl transition-all" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Message</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Share your thoughts, questions, or suggestions..." className="min-h-[160px] bg-background/80 border-2 border-border focus:border-primary rounded-xl resize-none transition-all" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-13 text-base font-bold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Send Message
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>

            {/* Sidebar — 5 cols */}
            <div className="lg:col-span-5 space-y-6 animate-fade-in animation-delay-200">
              
              {/* Contact Info Card */}
              <div className="rounded-2xl border-2 border-border/50 bg-card overflow-hidden hover:border-primary/30 hover:shadow-2xl transition-all duration-300">
                <div className="h-1.5 bg-gradient-to-r from-primary to-amber-500" />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold">Contact Info</h2>
                      <p className="text-sm text-muted-foreground">Ways to reach us</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm mb-1">Email</h3>
                        <a href="mailto:info@dibull.com" className="text-sm text-muted-foreground hover:text-primary transition-colors block">info@dibull.com</a>
                        <a href="mailto:cadbull2014@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors block">cadbull2014@gmail.com</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm mb-1">Location</h3>
                        <p className="text-sm text-muted-foreground">
                          A-823 Moneyplant High Street,<br />
                          Jagatpur Road, Gota Ahmedabad
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <h3 className="font-bold text-sm mb-3">Follow Us</h3>
                    <div className="flex items-center gap-2">
                      {[
                        { icon: Twitter, label: 'Twitter' },
                        { icon: Github, label: 'GitHub' },
                        { icon: Mail, label: 'Email' },
                      ].map((social) => (
                        <a
                          key={social.label}
                          href="#"
                          className="w-10 h-10 rounded-xl border-2 border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 hover:scale-110 transition-all duration-200"
                          aria-label={social.label}
                        >
                          <social.icon className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Donate CTA Card */}
              <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute -inset-2 bg-gradient-to-r from-rose-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl opacity-60" />
                <div className="relative rounded-2xl border-2 border-rose-500/30 bg-card overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold">Support Us</h2>
                        <p className="text-sm text-muted-foreground">Help spread Gita wisdom</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Your support helps maintain this platform and reach more seekers around the world.
                    </p>
                    <Button asChild className="w-full h-12 font-bold bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-90 border-0 shadow-lg">
                      <Link to="/donate">
                        <Heart className="h-5 w-5 mr-2" />
                        Donate Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Talk to Krishna CTA */}
              <div className="rounded-2xl border-2 border-border/50 bg-card overflow-hidden hover:border-primary/30 hover:shadow-2xl transition-all duration-300">
                <div className="h-1.5 bg-gradient-to-r from-primary to-amber-500" />
                <div className="p-8 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg mb-4">
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-extrabold text-lg mb-2">Need Guidance?</h3>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    Ask our AI-powered Gita coach for personalized wisdom.
                  </p>
                  <Button asChild variant="outline" className="w-full h-12 font-bold border-2">
                    <Link to="/chat">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Talk to Krishna
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/10 to-background" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-primary to-amber-500" />
              <h2 className="text-3xl md:text-4xl font-extrabold">
                Frequently Asked <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Questions</span>
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about Bhagavad Gita Gyan
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="group border-2 border-border/50 rounded-2xl px-6 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 data-[state=open]:border-primary/30 data-[state=open]:shadow-lg overflow-hidden"
                >
                  <AccordionTrigger className="text-left font-bold hover:no-underline py-5 [&[data-state=open]>svg]:text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-data-[state=open]:bg-gradient-to-br group-data-[state=open]:from-primary group-data-[state=open]:to-amber-500 transition-all">
                        <HelpCircle className="h-4 w-4 text-primary group-data-[state=open]:text-white transition-colors" />
                      </div>
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 pl-11 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
}
