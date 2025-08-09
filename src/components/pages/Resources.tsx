import Link from 'next/link';
import { Download, ExternalLink, Video, FileText, BookOpen } from "lucide-react";
import Footer from "../Footer";


const Resources = () => {
  const resources = [
    {
      type: "ebook",
      icon: BookOpen,
      title: "The Complete Retirement Planning Guide",
      description: "A comprehensive 50-page guide covering all aspects of retirement planning.",
      format: "PDF Download",
      link: "/resources/ebook",
      featured: true,
      color: "text-trust-blue"
    },
    {
      type: "video",
      icon: Video,
      title: "Retirement Planning Video Series",
      description: "Expert-led video tutorials on retirement planning strategies.",
      format: "Video Library",
      link: "/videos",
      color: "text-destructive"
    },
    {
      type: "checklist",
      icon: FileText,
      title: "Pre-Retirement Checklist",
      description: "Essential tasks to complete 5-10 years before retirement.",
      format: "PDF Download",
      link: "/resources/pre-retirement-checklist",
      color: "text-trust-green"
    },
    {
      type: "guide",
      icon: FileText,
      title: "Social Security Claiming Guide",
      description: "Strategies to maximize your Social Security benefits.",
      format: "PDF Download",
      link: "/resources/social-security-guide",
      color: "text-trust-gold"
    },
    {
      type: "worksheet",
      icon: FileText,
      title: "Retirement Budget Worksheet",
      description: "Plan your retirement expenses with this detailed worksheet.",
      format: "Excel & PDF",
      link: "/resources/budget-worksheet",
      color: "text-purple-600"
    },
    {
      type: "guide",
      icon: FileText,
      title: "Medicare Enrollment Guide",
      description: "Navigate Medicare enrollment with confidence.",
      format: "PDF Download",
      link: "/resources/medicare-guide",
      color: "text-indigo-600"
    },
    {
      type: "checklist",
      icon: FileText,
      title: "Estate Planning Checklist",
      description: "Essential documents and steps for estate planning.",
      format: "PDF Download",
      link: "/resources/estate-planning-checklist",
      color: "text-teal-600"
    },
    {
      type: "calculator",
      icon: ExternalLink,
      title: "Interactive Calculators",
      description: "Access all our retirement planning calculators in one place.",
      format: "Web Tools",
      link: "/calculators",
      color: "text-orange-600"
    }
  ];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "ebook": "bg-trust-blue text-white",
      "video": "bg-red-100 text-red-700",
      "checklist": "bg-green-100 text-green-700",
      "guide": "bg-trust-gold text-white",
      "worksheet": "bg-purple-100 text-purple-700",
      "calculator": "bg-orange-100 text-orange-700"
    };
    return colors[type] || "bg-trust-blue-light text-trust-blue";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-trust-navy mb-4">
              Free Retirement Resources
            </h1>
            <p className="text-xl text-trust-gray max-w-3xl mx-auto">
              Download guides, checklists, and educational materials to help you plan for retirement.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <Card key={index} className={`hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur-sm ${resource.featured ? 'ring-2 ring-trust-blue' : ''}`}>
                  <CardHeader>
                    {resource.featured && (
                      <Badge className="w-fit mb-2 bg-trust-blue text-white">Featured Resource</Badge>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <IconComponent className={`h-8 w-8 ${resource.color}`} />
                      <Badge className={getTypeColor(resource.type)}>
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-trust-navy leading-tight">{resource.title}</CardTitle>
                    <CardDescription className="text-trust-gray">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-trust-gray mb-4">
                        <Download className="h-4 w-4 mr-2" />
                        {resource.format}
                      </div>
                    </div>
                    <Link href={resource.link} className="block">
                      <Button className="w-full bg-trust-blue hover:bg-trust-navy text-white">
                        {resource.type === 'calculator' ? 'Access Tools' : 'Download Resource'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Newsletter Signup */}
          <div className="mt-16 bg-trust-light-gray rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-trust-navy mb-4">
              Stay Updated with New Resources
            </h3>
            <p className="text-trust-gray mb-6 max-w-2xl mx-auto">
              Get notified when we publish new guides, calculators, and educational content to help with your retirement planning.
            </p>
            <Link href="/contact">
              <Button className="bg-trust-blue hover:bg-trust-navy text-white px-8 py-3">
                Subscribe to Updates
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Resources;