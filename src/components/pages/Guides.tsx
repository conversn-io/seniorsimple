import { useState } from "react";
import Link from 'next/link';
import { BookOpen, Clock, Users, Search, Filter, Shield, TrendingUp } from "lucide-react";
import Footer from "../Footer";

const Guides = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["All", "Retirement", "Annuities", "Housing", "Estate Planning", "Healthcare", "Tax Planning"];
  const guides = [
    {
      title: "The Indexed Annuities Secret: Market Gains Without Market Risk",
      description: "Discover how indexed annuities protect your principal while capturing market upside - the retirement strategy Wall Street doesn't want you to know.",
      readTime: "12 min read",
      category: "Annuities",
      difficulty: "Beginner",
      link: "/guides/indexed-annuities-secret",
      featured: true,
      isSecret: true
    },
    {
      title: "Complete Guide to Retirement Planning",
      description: "Everything you need to know about planning for a secure retirement, from savings strategies to income planning.",
      readTime: "15 min read",
      category: "Retirement",
      difficulty: "Beginner",
      link: "/guides/retirement-planning"
    },
    {
      title: "Understanding Reverse Mortgages",
      description: "A comprehensive look at reverse mortgages, including pros, cons, and who they're right for.",
      readTime: "12 min read",
      category: "Housing",
      difficulty: "Intermediate",
      link: "/guides/reverse-mortgages"
    },
    {
      title: "Estate Planning Essentials",
      description: "Step-by-step guide to creating a will, setting up trusts, and protecting your legacy.",
      readTime: "18 min read",
      category: "Estate Planning",
      difficulty: "Intermediate",
      link: "/guides/estate-planning"
    },
    {
      title: "Medicare Made Simple",
      description: "Navigate Medicare options, enrollment periods, and costs with confidence.",
      readTime: "10 min read",
      category: "Healthcare",
      difficulty: "Beginner",
      link: "/guides/medicare-guide"
    },
    {
      title: "Social Security Optimization",
      description: "Maximize your Social Security benefits with smart claiming strategies.",
      readTime: "14 min read",
      category: "Retirement",
      difficulty: "Intermediate",
      link: "/guides/social-security"
    },
    {
      title: "Downsizing Your Home in Retirement",
      description: "Tips and strategies for successfully downsizing to reduce costs and simplify life.",
      readTime: "8 min read",
      category: "Housing",
      difficulty: "Beginner",
      link: "/guides/downsizing"
    },
    {
      title: "Tax-Efficient Retirement Withdrawals",
      description: "Strategies to minimize taxes when taking money from retirement accounts.",
      readTime: "16 min read",
      category: "Tax Planning",
      difficulty: "Advanced",
      link: "/guides/tax-efficient-withdrawals"
    },
    {
      title: "Long-Term Care Planning",
      description: "Prepare for potential long-term care needs and understand your options.",
      readTime: "13 min read",
      category: "Healthcare",
      difficulty: "Intermediate",
      link: "/guides/long-term-care"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-trust-green text-white";
      case "Intermediate": return "bg-trust-gold text-white";
      case "Advanced": return "bg-destructive text-white";
      default: return "bg-trust-blue text-white";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Retirement": "bg-trust-blue-light text-trust-blue",
      "Housing": "bg-orange-100 text-orange-700",
      "Estate Planning": "bg-purple-100 text-purple-700",
      "Healthcare": "bg-red-100 text-red-700",
      "Tax Planning": "bg-green-100 text-green-700"
    };
    return colors[category] || "bg-trust-blue-light text-trust-blue";
  };

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === "All" || guide.category === selectedCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Featured Guide */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-trust-navy to-trust-blue text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-trust-gold text-trust-navy mb-4 text-sm font-semibold px-4 py-2">
                🔒 EXCLUSIVE GUIDE
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                The Indexed Annuities Secret
                <span className="block text-trust-gold">Wall Street Doesn't Want You to Know</span>
              </h1>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Discover how to protect your retirement savings from market crashes while still capturing 
                market gains. This proven strategy has helped thousands of retirees sleep peacefully at night.
              </p>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-trust-gold" />
                  <span>100% Principal Protection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-trust-gold" />
                  <span>Market Upside Potential</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">What You'll Learn:</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-trust-gold rounded-full mt-2 mr-3"></div>
                  <span>How indexed annuities protect 100% of your principal</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-trust-gold rounded-full mt-2 mr-3"></div>
                  <span>The "upside without downside" strategy explained</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-trust-gold rounded-full mt-2 mr-3"></div>
                  <span>Real examples of market protection in action</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-trust-gold rounded-full mt-2 mr-3"></div>
                  <span>How to evaluate if this strategy is right for you</span>
                </li>
              </ul>
              
              <Link href="/guides/indexed-annuities-secret">
                <Button size="lg" className="w-full bg-trust-gold hover:bg-trust-gold/90 text-trust-navy font-bold text-lg py-4">
                  🔓 Get Free Access to This Secret Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-trust-light-gray border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-trust-gray" />
              <span className="font-semibold text-trust-navy">Filter by category:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category 
                      ? "bg-trust-blue text-white" 
                      : "border-trust-blue text-trust-blue hover:bg-trust-blue-light"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-trust-gray" />
              <Input
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 border-trust-blue-light focus:border-trust-blue"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur-sm ${guide.featured && !guide.isSecret ? 'ring-2 ring-trust-blue' : ''} ${guide.isSecret ? 'ring-2 ring-trust-gold' : ''}`}>
                <CardHeader>
                  {guide.isSecret && (
                    <Badge className="w-fit mb-2 bg-trust-gold text-trust-navy">🔒 Exclusive Secret</Badge>
                  )}
                  {guide.featured && !guide.isSecret && (
                    <Badge className="w-fit mb-2 bg-trust-blue text-white">Featured Guide</Badge>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(guide.category)}>
                      {guide.category}
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(guide.difficulty)}>
                      {guide.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-trust-navy leading-tight">{guide.title}</CardTitle>
                  <CardDescription className="text-trust-gray">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-trust-gray">
                      <Clock className="h-4 w-4 mr-1" />
                      {guide.readTime}
                    </div>
                    <div className="flex items-center text-sm text-trust-gray">
                      <BookOpen className="h-4 w-4 mr-1" />
                      Guide
                    </div>
                  </div>
                  <Link href={guide.link} className="block">
                    <Button className="w-full bg-trust-blue hover:bg-trust-navy text-white">
                      Read Guide
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Guides;