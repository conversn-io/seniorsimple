'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

type FooterType = 'standard' | 'funnel' | 'minimal';
type FooterVariant = 'insurance' | 'mortgage';
type HeaderType = 'standard' | 'funnel';

interface LayoutContextType {
  footerType: FooterType;
  setFooterType: (type: FooterType) => void;
  footerVariant: FooterVariant;
  setFooterVariant: (variant: FooterVariant) => void;
  headerType: HeaderType;
  setHeaderType: (type: HeaderType) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [footerType, setFooterType] = useState<FooterType>('standard');
  const [footerVariant, setFooterVariant] = useState<FooterVariant>('insurance');
  const [headerType, setHeaderType] = useState<HeaderType>('standard');

  return (
    <LayoutContext.Provider value={{ footerType, setFooterType, footerVariant, setFooterVariant, headerType, setHeaderType }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useFooter = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useFooter must be used within a LayoutProvider');
  }
  return { 
    footerType: context.footerType, 
    setFooterType: context.setFooterType,
    footerVariant: context.footerVariant,
    setFooterVariant: context.setFooterVariant
  };
};

export const useHeader = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a LayoutProvider');
  }
  return { headerType: context.headerType, setHeaderType: context.setHeaderType };
};
