import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  User,
  Zap,
  Shield,
  Database,
  Code,
  CheckCircle2,
  ArrowRight,
  Star,
  ChevronRight,
  Github,
  Loader2,
  Twitter,
  Instagram,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Define the Plan type
interface Plan {
  id: string;
  object: string;
  active: boolean;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  product: string;
  created: number;
  livemode: boolean;
  [key: string]: any;
}

// Testimonial interface
interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
}

// Feature interface
interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
}

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Use the Supabase client to call the Edge Function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-get-plans",
      );

      if (error) {
        throw error;
      }

      setPlans(data || []);
      setError("");
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      setError("Failed to load plans. Please try again later.");
    }
  };

  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "default",
      });
      window.location.href = "/login?redirect=pricing";
      return;
    }

    setIsLoading(true);
    setProcessingPlanId(priceId);
    setError("");

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user.id,
            return_url: `${window.location.origin}/dashboard`,
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        toast({
          title: "Redirecting to checkout",
          description:
            "You'll be redirected to Stripe to complete your purchase.",
          variant: "default",
        });
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError("Failed to create checkout session. Please try again.");
      toast({
        title: "Checkout failed",
        description:
          "There was an error creating your checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProcessingPlanId(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    });

    return formatter.format(amount / 100);
  };

  // Features data for the grants directory
  const features: Feature[] = [
    {
      title: "Comprehensive Grant Database",
      description:
        "Access thousands of arts grants and residencies updated regularly with detailed information and requirements.",
      icon: <Database className="h-10 w-10 text-black" />,
    },
    {
      title: "Advanced Search & Filters",
      description:
        "Find the perfect opportunities with powerful search tools filtering by funding amount, deadline, art form, and location.",
      icon: <Zap className="h-10 w-10 text-black" />,
    },
    {
      title: "Application Tracking",
      description:
        "Save favorite grants and track your application status from initial submission to final decision.",
      icon: <CheckCircle2 className="h-10 w-10 text-black" />,
    },
    {
      title: "Secure User Profiles",
      description:
        "Customize your artist profile and manage your subscription with our secure authentication system.",
      icon: <Shield className="h-10 w-10 text-black" />,
    },
  ];

  // Sample testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Maya Rodriguez",
      role: "Visual Artist",
      company: "Independent",
      content:
        "The Grants Directory has been invaluable for my career. I found and successfully applied for two residencies that I wouldn't have discovered otherwise.",
      avatar: "maya",
    },
    {
      id: 2,
      name: "James Wilson",
      role: "Sculptor",
      company: "Wilson Studios",
      content:
        "The search filters saved me countless hours. I was able to find grants specifically for sculptors in my region with upcoming deadlines.",
      avatar: "james",
    },
    {
      id: 3,
      name: "Leila Patel",
      role: "Performance Artist",
      company: "Avant Collective",
      content:
        "The application tracking feature helped me stay organized during grant season. I secured funding for my latest project thanks to this platform.",
      avatar: "leila",
    },
  ];

  // Plan features
  const getPlanFeatures = (planType: string) => {
    const basicFeatures = [
      "Access to grant directory",
      "Basic search functionality",
      "Save up to 10 favorite grants",
      "Monthly newsletter",
    ];

    const proFeatures = [
      ...basicFeatures,
      "Advanced search filters",
      "Unlimited saved grants",
      "Application tracking",
      "Early access to new opportunities",
    ];

    const premiumFeatures = [
      ...proFeatures,
      "Personalized grant recommendations",
      "Application review assistance",
      "Priority customer support",
      "Grant writing resources",
    ];

    if (planType.includes("PRO")) return proFeatures;
    if (planType.includes("PREMIUM")) return premiumFeatures;
    return basicFeatures;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="font-bold text-xl flex items-center text-black"
            >
              <Database className="h-6 w-6 mr-2 text-black" />
              ArtistGrants Directory
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-black"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 text-gray-700 hover:text-black"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt={user.email || ""}
                        />
                        <AvatarFallback>
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block">
                        {user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white border-gray-200"
                  >
                    <DropdownMenuLabel className="text-black">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem className="text-gray-700 hover:text-black focus:text-black">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700 hover:text-black focus:text-black">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem
                      onSelect={() => signOut()}
                      className="text-gray-700 hover:text-black focus:text-black"
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-black"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-black text-white hover:bg-gray-800">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 space-y-8">
                <div>
                  <Badge className="mb-4 bg-gray-200 text-gray-800 hover:bg-gray-300 border-none">
                    For Artists & Creators
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    Discover Grants & Residencies for Artists
                  </h1>
                </div>
                <p className="text-lg md:text-xl text-gray-600">
                  Access our comprehensive directory of funding opportunities
                  and residencies for artists across all disciplines. Find the
                  perfect grants to support your creative practice.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
                    >
                      Start Your Subscription
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-gray-300 text-gray-700 hover:border-gray-500 hover:text-black w-full sm:w-auto"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span>Updated weekly</span>
                  <Separator
                    orientation="vertical"
                    className="h-4 mx-2 bg-gray-300"
                  />
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span>1000+ opportunities</span>
                  <Separator
                    orientation="vertical"
                    className="h-4 mx-2 bg-gray-300"
                  />
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span>All artistic disciplines</span>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-gray-200/60 via-gray-400/40 to-black/10 rounded-3xl blur-2xl transform scale-110" />
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-1 bg-gradient-to-r from-gray-200 via-gray-400 to-black rounded-t-xl">
                    <div className="flex items-center gap-2 px-3 py-1">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <div className="ml-2 text-xs text-black font-medium">
                        Tempo App
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-600 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <Database className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <h4 className="font-medium text-black">
                            Guggenheim Fellowship
                          </h4>
                          <p>$50,000 | Deadline: April 15, 2024</p>
                          <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
                            Visual Arts
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <Database className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <h4 className="font-medium text-black">
                            MacDowell Colony Residency
                          </h4>
                          <p>Fully Funded | Deadline: Feb 10, 2024</p>
                          <Badge className="mt-1 bg-purple-100 text-purple-800 hover:bg-purple-200 border-none">
                            All Disciplines
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <Database className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <h4 className="font-medium text-black">
                            Creative Capital Grant
                          </h4>
                          <p>$50,000 | Deadline: March 1, 2024</p>
                          <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-200 border-none">
                            Performing Arts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-gray-200/60 blur-[100px]" />
          <div className="absolute bottom-0 right-0 -z-10 h-[300px] w-[300px] rounded-full bg-gray-400/40 blur-[100px]" />
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gray-200 text-gray-800 hover:bg-gray-300 border-none">
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-black">
                Everything Artists Need to Find Funding
              </h2>
              <p className="text-gray-600 max-w-[700px] mx-auto">
                Our comprehensive directory and powerful tools help artists of
                all disciplines discover and apply for grants and residencies
                worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-black">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gray-200 text-gray-800 hover:bg-gray-300 border-none">
                Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-black">
                Subscription Plans for Artists
              </h2>
              <p className="text-gray-600 max-w-[700px] mx-auto">
                Choose the perfect plan for your creative practice. All plans
                include access to our grant directory. Invest in your artistic
                career with our affordable subscription options.
              </p>
            </div>

            {error && (
              <div
                className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded relative mb-6"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
                <button
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  onClick={() => setError("")}
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="flex flex-col h-full border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-lg hover:shadow-xl transition-all"
                >
                  <CardHeader className="pb-4">
                    <CardDescription className="text-sm text-gray-600">
                      {plan.interval_count === 1
                        ? "Monthly"
                        : `Every ${plan.interval_count} ${plan.interval}s`}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-black">
                        {formatCurrency(plan.amount, plan.currency)}
                      </span>
                      <span className="text-gray-600">/{plan.interval}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <Separator className="my-4 bg-gray-200" />
                    <ul className="space-y-3">
                      {getPlanFeatures(plan.product).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start text-gray-700"
                        >
                          <CheckCircle2 className="h-5 w-5 text-black mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-black text-white hover:bg-gray-800"
                      onClick={() => handleCheckout(plan.id)}
                      disabled={isLoading}
                    >
                      {isLoading && processingPlanId === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Subscribe Now
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gray-200 text-gray-800 hover:bg-gray-300 border-none">
                Testimonials
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-black">
                Loved by Artists Worldwide
              </h2>
              <p className="text-gray-600 max-w-[700px] mx-auto">
                See what artists and creators have to say about our Grants &
                Residencies Directory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.avatar}`}
                          alt={testimonial.name}
                        />
                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base text-black">
                          {testimonial.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {testimonial.role} at {testimonial.company}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-black text-black"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{testimonial.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 mx-auto">
            <div className="bg-gradient-to-r from-gray-100 to-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
                  Ready to Find Your Next Opportunity?
                </h2>
                <p className="text-lg md:text-xl mb-8 text-gray-600">
                  Join thousands of artists who have found funding and
                  residencies through our comprehensive directory.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
                    >
                      Subscribe Now
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-gray-300 text-gray-700 hover:border-gray-500 hover:text-black w-full sm:w-auto"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link
                to="/"
                className="font-bold text-xl flex items-center mb-4 text-black"
              >
                <Database className="h-5 w-5 mr-2 text-black" />
                ArtistGrants
              </Link>
              <p className="text-gray-600 mb-4">
                A comprehensive directory of grants and residencies for artists
                across all disciplines.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-600 hover:text-black"
                >
                  <Github className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-600 hover:text-black"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-600 hover:text-black"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-black">Directory</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Grants
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Residencies
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Fellowships
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-black">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Grant Writing Tips
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Artist Statements
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-black">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-black">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-200" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} ArtistGrants Directory. All rights
              reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="#" className="text-sm text-gray-600 hover:text-black">
                Privacy
              </Link>
              <Link to="#" className="text-sm text-gray-600 hover:text-black">
                Terms
              </Link>
              <Link to="#" className="text-sm text-gray-600 hover:text-black">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
