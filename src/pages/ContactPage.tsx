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
  Sparkles
} from 'lucide-react';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
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
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form submitted:', data);
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

      {/* Hero Section with WebFX styling */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-28">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <RadialGlow position="top-right" color="primary" className="opacity-50" />
          <RadialGlow position="bottom-left" color="amber" className="opacity-30" />
          <FloatingOm className="top-20 left-10 hidden lg:block" />
          <FloatingOm className="bottom-20 right-20 hidden lg:block" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_40%)]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
              <MessageCircle className="h-4 w-4" />
              We're here to help
            </div>
            <h1 className="headline-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              Get In <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions, suggestions, or just want to connect? We'd love to hear from you.
              Reach out and let's explore the path of wisdom together.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <div className="group relative rounded-2xl overflow-hidden">
              {/* Left gradient border */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-amber-500 to-orange-500 z-10" />

              <div className="border-2 border-l-0 border-border/50 bg-card p-8 rounded-r-2xl group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/5 transition-all duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Send a Message</h2>
                    <p className="text-muted-foreground">Fill out the form below</p>
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
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your name"
                                className="bg-background border-border/50 focus:border-primary/50"
                                {...field}
                              />
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                className="bg-background border-border/50 focus:border-primary/50"
                                {...field}
                              />
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
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="What's this about?"
                              className="bg-background border-border/50 focus:border-primary/50"
                              {...field}
                            />
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
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share your thoughts, questions, or suggestions..."
                              className="min-h-[150px] bg-background border-border/50 focus:border-primary/50 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Info Card */}
              <div className="group relative rounded-2xl overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-amber-500 to-orange-500 z-10" />

                <div className="border-2 border-l-0 border-border/50 bg-card p-8 rounded-r-2xl group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Contact Info</h2>
                      <p className="text-muted-foreground">Ways to reach us</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <div className="flex flex-col gap-1">
                          <a href="mailto:info@dibull.com" className="text-muted-foreground hover:text-primary transition-colors">
                            info@dibull.com
                          </a>
                          <a href="mailto:cadbull2014@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                            cadbull2014@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Location</h3>
                        <p className="text-muted-foreground">
                          A-823 Moneyplant High street,<br />
                          Jagatpur Road, Gota Ahmedabad
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-8 pt-8 border-t border-border/50">
                    <h3 className="font-semibold mb-4">Follow Us</h3>
                    <div className="flex items-center gap-3">
                      <a
                        href="#"
                        className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                        aria-label="Twitter"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                        aria-label="GitHub"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                        aria-label="Email"
                      >
                        <Mail className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donate Card */}
              <div className="group relative rounded-2xl overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-rose-500 via-orange-500 to-amber-500 z-10" />

                <div className="border-2 border-l-0 border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-orange-500/5 p-8 rounded-r-2xl group-hover:shadow-xl group-hover:shadow-rose-500/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Support Our Mission</h2>
                      <p className="text-muted-foreground">Help spread Gita wisdom</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Your support helps us maintain this platform and reach more seekers around the world.
                  </p>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30 transition-all"
                  >
                    <a href="/donate">
                      <Heart className="h-4 w-4 mr-2" />
                      Donate Now
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
              <HelpCircle className="h-4 w-4" />
              Common Questions
            </div>
            <h2 className="headline-bold text-3xl md:text-4xl mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about Bhagavad Gita Gyan
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="group border-2 border-border/50 rounded-xl px-6 bg-card hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <AccordionTrigger className="text-left font-semibold hover:text-primary group-hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
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
