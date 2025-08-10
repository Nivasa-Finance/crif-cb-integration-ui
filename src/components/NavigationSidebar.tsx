import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationSidebarProps {
  sections: { id: string; title: string; count?: number }[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export const NavigationSidebar = ({ sections, activeSection, onSectionClick }: NavigationSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onSectionClick(sectionId);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-64 bg-card border-l border-border transform transition-transform duration-300 ease-in-out z-40
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        md:translate-x-0 md:relative md:w-72
      `}>
        <h3 className="font-semibold text-lg mb-4 p-4 pb-0">Report Sections</h3>
        <nav className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto px-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                ${activeSection === section.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent hover:text-accent-foreground'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{section.title}</span>
                {section.count !== undefined && (
                  <span className="text-xs opacity-70">({section.count})</span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};