"use client";

import React, { useState, useCallback } from 'react';
import { X, Info, Check, ChevronRight, Sparkles, Sun, Moon, Palette } from 'lucide-react';
import { Shade } from '@/types';

// Skin tone categories with color ranges
const SKIN_TONES = [
  {
    id: 'fair',
    name: 'Fair',
    description: 'Very light skin that burns easily',
    color: '#FFE4C4',
    gradient: 'from-[#FFF0E0] to-[#FFE4C4]',
    shadeRange: ['Porcelain', 'Ivory', 'Shell', 'Pearl', 'Vanilla'],
    undertones: ['Pink', 'Peach', 'Neutral'],
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Light skin that tans minimally',
    color: '#F5DEB3',
    gradient: 'from-[#FFE4C4] to-[#F5DEB3]',
    shadeRange: ['Nude', 'Buff', 'Linen', 'Natural', 'Beige'],
    undertones: ['Warm', 'Cool', 'Neutral'],
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Medium skin that tans gradually',
    color: '#DEB887',
    gradient: 'from-[#F5DEB3] to-[#DEB887]',
    shadeRange: ['Sand', 'Honey', 'Golden', 'Caramel', 'Amber'],
    undertones: ['Golden', 'Olive', 'Neutral'],
  },
  {
    id: 'tan',
    name: 'Tan',
    description: 'Warm toned skin that tans easily',
    color: '#C19A6B',
    gradient: 'from-[#DEB887] to-[#C19A6B]',
    shadeRange: ['Toffee', 'Cinnamon', 'Chestnut', 'Sienna', 'Bronze'],
    undertones: ['Warm', 'Golden', 'Red'],
  },
  {
    id: 'deep',
    name: 'Deep',
    description: 'Rich, deep skin tones',
    color: '#8B4513',
    gradient: 'from-[#C19A6B] to-[#8B4513]',
    shadeRange: ['Cocoa', 'Espresso', 'Mahogany', 'Ebony', 'Truffle'],
    undertones: ['Red', 'Golden', 'Neutral'],
  },
];

// Undertone guide
const UNDERTONES = [
  {
    id: 'warm',
    name: 'Warm',
    icon: Sun,
    description: 'Golden, peachy, or yellow undertones',
    veinColor: 'Green veins on wrist',
    jewelryMatch: 'Gold jewelry looks best',
    sunReaction: 'Skin turns golden when tanned',
    colors: ['#FFD700', '#FFA500', '#FF8C00'],
  },
  {
    id: 'cool',
    name: 'Cool',
    icon: Moon,
    description: 'Pink, red, or bluish undertones',
    veinColor: 'Blue/purple veins on wrist',
    jewelryMatch: 'Silver jewelry looks best',
    sunReaction: 'Skin turns pink when tanned',
    colors: ['#FFB6C1', '#DDA0DD', '#E6E6FA'],
  },
  {
    id: 'neutral',
    name: 'Neutral',
    icon: Palette,
    description: 'Mix of warm and cool undertones',
    veinColor: 'Blue-green veins on wrist',
    jewelryMatch: 'Both gold and silver look great',
    sunReaction: 'Skin can go either way',
    colors: ['#F5DEB3', '#DEB887', '#D2B48C'],
  },
];

// Tips for shade matching
const SHADE_TIPS = [
  {
    title: 'Test on Jawline',
    description: 'Apply shades along your jawline to find the perfect match that blends seamlessly.',
  },
  {
    title: 'Check in Natural Light',
    description: 'Always check your shade match in natural daylight for the most accurate color.',
  },
  {
    title: 'Consider Neck Match',
    description: 'The right shade should match both your face and neck for a natural look.',
  },
  {
    title: 'Seasonal Changes',
    description: 'You may need different shades for summer and winter as your skin tone changes.',
  },
];

interface ShadeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  productShades?: Shade[];
  productCategory?: string;
  onSelectShade?: (shade: Shade) => void;
}

export const ShadeGuide: React.FC<ShadeGuideProps> = ({
  isOpen,
  onClose,
  productShades = [],
  productCategory,
  onSelectShade,
}) => {
  const [selectedSkinTone, setSelectedSkinTone] = useState<string | null>(null);
  const [selectedUndertone, setSelectedUndertone] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'skintone' | 'undertone' | 'tips'>('skintone');

  // Find matching shades based on skin tone selection
  const getMatchingShades = useCallback(() => {
    if (!selectedSkinTone || productShades.length === 0) return [];

    const skinTone = SKIN_TONES.find(t => t.id === selectedSkinTone);
    if (!skinTone) return [];

    // Match shades based on name similarity to skin tone shade range
    return productShades.filter(shade => {
      const shadeName = shade.name.toLowerCase();
      return skinTone.shadeRange.some(range =>
        shadeName.includes(range.toLowerCase()) ||
        range.toLowerCase().includes(shadeName)
      );
    });
  }, [selectedSkinTone, productShades]);

  // Get all shades sorted by color luminosity
  const getSortedShades = useCallback(() => {
    if (productShades.length === 0) return [];

    return [...productShades].sort((a, b) => {
      // Convert hex to luminosity for sorting light to dark
      const getLuminosity = (hex: string) => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const blue = rgb & 0xff;
        return 0.299 * r + 0.587 * g + 0.114 * blue;
      };
      return getLuminosity(b.color) - getLuminosity(a.color);
    });
  }, [productShades]);

  const matchingShades = getMatchingShades();
  const sortedShades = getSortedShades();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Shade Guide
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Find your perfect shade match
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('skintone')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === 'skintone'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Skin Tone
              {activeTab === 'skintone' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('undertone')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === 'undertone'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Undertone
              {activeTab === 'undertone' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === 'tips'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tips
              {activeTab === 'tips' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {/* Skin Tone Tab */}
          {activeTab === 'skintone' && (
            <div className="space-y-8">
              {/* Skin Tone Selector */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Your Skin Tone</h3>
                <div className="grid grid-cols-5 gap-3">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedSkinTone(tone.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedSkinTone === tone.id
                          ? 'border-primary shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Color Swatch */}
                      <div
                        className={`w-full aspect-square rounded-full mb-3 bg-gradient-to-b ${tone.gradient}`}
                        style={{ boxShadow: `0 4px 12px ${tone.color}40` }}
                      />
                      <p className="text-sm font-medium text-center">{tone.name}</p>
                      {selectedSkinTone === tone.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Skin Tone Details */}
              {selectedSkinTone && (
                <div className="bg-gray-50 rounded-xl p-6">
                  {SKIN_TONES.filter(t => t.id === selectedSkinTone).map((tone) => (
                    <div key={tone.id}>
                      <h4 className="font-semibold text-lg mb-2">{tone.name} Skin</h4>
                      <p className="text-gray-600 mb-4">{tone.description}</p>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Recommended Shade Names */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Look for shades named:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tone.shadeRange.map((shade) => (
                              <span
                                key={shade}
                                className="px-3 py-1 bg-white rounded-full text-sm border border-gray-200"
                              >
                                {shade}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Undertones */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Common undertones:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tone.undertones.map((undertone) => (
                              <span
                                key={undertone}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                              >
                                {undertone}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Product Shades Section */}
              {productShades.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {productCategory ? `${productCategory} Shades` : 'Available Shades'}
                  </h3>

                  {/* Matching Shades */}
                  {selectedSkinTone && matchingShades.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium text-primary">
                          Recommended for your skin tone
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {matchingShades.map((shade) => (
                          <button
                            key={shade._id}
                            onClick={() => onSelectShade?.(shade)}
                            className="p-3 bg-primary/5 rounded-xl border-2 border-primary/20 hover:border-primary transition-all group"
                          >
                            <div
                              className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white shadow-lg"
                              style={{ backgroundColor: shade.color }}
                            />
                            <p className="text-sm font-medium text-center truncate">
                              {shade.name}
                            </p>
                            <p className="text-xs text-primary text-center mt-1">
                              Best Match
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Shades */}
                  <div>
                    <p className="text-sm text-gray-500 mb-3">All available shades (light to dark)</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {sortedShades.map((shade) => (
                        <button
                          key={shade._id}
                          onClick={() => onSelectShade?.(shade)}
                          className="p-2 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                        >
                          <div
                            className="w-10 h-10 rounded-full mx-auto mb-2 border border-gray-200 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: shade.color }}
                          />
                          <p className="text-xs text-center truncate">{shade.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Undertone Tab */}
          {activeTab === 'undertone' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Find Your Undertone</h3>
                <p className="text-gray-600 mb-6">
                  Your undertone is the subtle color beneath your skin's surface. Understanding it helps you choose the most flattering shades.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  {UNDERTONES.map((undertone) => {
                    const Icon = undertone.icon;
                    return (
                      <button
                        key={undertone.id}
                        onClick={() => setSelectedUndertone(undertone.id)}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${
                          selectedUndertone === undertone.id
                            ? 'border-primary bg-primary/5 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-3 rounded-full ${
                            selectedUndertone === undertone.id
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon size={24} />
                          </div>
                          <h4 className="text-lg font-semibold">{undertone.name}</h4>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">
                          {undertone.description}
                        </p>

                        {/* Color swatches */}
                        <div className="flex gap-2 mb-4">
                          {undertone.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full border border-gray-200"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        {selectedUndertone === undertone.id && (
                          <div className="space-y-2 pt-4 border-t border-gray-200">
                            <div className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-600">{undertone.veinColor}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-600">{undertone.jewelryMatch}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-600">{undertone.sunReaction}</p>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Test */}
              <div className="bg-gradient-to-r from-primary/10 to-purple-100 rounded-xl p-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Quick Undertone Test
                </h4>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">1</span>
                    <span>Look at the veins on the inside of your wrist in natural light.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">2</span>
                    <span>If they appear <strong>green</strong>, you likely have warm undertones.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">3</span>
                    <span>If they appear <strong>blue or purple</strong>, you likely have cool undertones.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">4</span>
                    <span>If you see <strong>both</strong>, you likely have neutral undertones.</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Shade Matching Tips</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {SHADE_TIPS.map((tip, index) => (
                    <div
                      key={index}
                      className="p-5 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                          {index + 1}
                        </div>
                        <h4 className="font-semibold">{tip.title}</h4>
                      </div>
                      <p className="text-gray-600 text-sm ml-11">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product-Specific Tips */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Pro Tips by Product Type
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-amber-800">Foundation & Concealer</p>
                    <p className="text-sm text-gray-600">Test 2-3 shades on your jawline. The shade that disappears is your match.</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">Lipstick</p>
                    <p className="text-sm text-gray-600">Warm undertones suit coral and orange-based reds. Cool undertones suit berry and blue-based reds.</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">Blush</p>
                    <p className="text-sm text-gray-600">Choose a shade similar to your natural flush. Pinch your cheeks to see your natural color.</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">Bronzer</p>
                    <p className="text-sm text-gray-600">Select a bronzer 1-2 shades darker than your skin tone for a natural sun-kissed look.</p>
                  </div>
                </div>
              </div>

              {/* Size Guide for Products */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold mb-4">Product Size Guide</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Product</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Mini</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Regular</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Large</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">Foundation</td>
                        <td className="py-2 px-3">15ml</td>
                        <td className="py-2 px-3">30ml</td>
                        <td className="py-2 px-3">50ml</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">Lipstick</td>
                        <td className="py-2 px-3">1.5g</td>
                        <td className="py-2 px-3">3.5g</td>
                        <td className="py-2 px-3">5g</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">Mascara</td>
                        <td className="py-2 px-3">4ml</td>
                        <td className="py-2 px-3">8ml</td>
                        <td className="py-2 px-3">12ml</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Setting Powder</td>
                        <td className="py-2 px-3">5g</td>
                        <td className="py-2 px-3">10g</td>
                        <td className="py-2 px-3">15g</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShadeGuide;
