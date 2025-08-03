"use client"

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';

export default function RecipeCollection() {
  const [recipes, setRecipes] = useState([]);
  const [tips, setTips] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ protein: 'all', veggie: 'all' });
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [adsLoaded, setAdsLoaded] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  // Load ads when recipes are loaded and we're on the recipes section
  useEffect(() => {
    if (!loading && activeSection === 'recipes' && filteredRecipes.length > 0 && !adsLoaded) {
      // Wait a bit for the DOM elements to be rendered
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.ezstandalone) {
          // Load all ads at once for better performance
          window.ezstandalone.cmd.push(function () {
            window.ezstandalone.showAds(115, 111, 112, 113);
          });
          setAdsLoaded(true);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, activeSection, filteredRecipes.length, adsLoaded]);

  const loadAllData = async () => {
    try {
      const [recipesRes, tipsRes, snacksRes, promptsRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/tips'),
        fetch('/api/snacks'),
        fetch('/api/prompts')
      ]);

      const [recipesData, tipsData, snacksData, promptsData] = await Promise.all([
        recipesRes.json(),
        tipsRes.json(),
        snacksRes.json(),
        promptsRes.json()
      ]);

      setRecipes(recipesData);
      setTips(tipsData);
      setSnacks(snacksData);
      setPrompts(promptsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = !searchQuery || 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProtein = filters.protein === 'all' || 
      recipe.protein.toLowerCase() === filters.protein;
    
    const matchesVeggie = filters.veggie === 'all' || 
      recipe.veggie === filters.veggie;

    return matchesSearch && matchesProtein && matchesVeggie;
  });

  const RecipeCard = ({ recipe, index }) => {
    const [expanded, setExpanded] = useState(false);
    const proteinClass = recipe.protein.toLowerCase().replace(/[^a-z]/g, '');

    return (
      <article className={`bg-white rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-t-4 ${
        proteinClass === 'beef' ? 'border-red-500' :
        proteinClass === 'pork' ? 'border-orange-500' :
        proteinClass === 'chicken' ? 'border-yellow-500' :
        proteinClass === 'fish' ? 'border-blue-500' :
        'border-purple-500'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{recipe.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
            proteinClass === 'beef' ? 'bg-red-500' :
            proteinClass === 'pork' ? 'bg-orange-500' :
            proteinClass === 'chicken' ? 'bg-yellow-500' :
            proteinClass === 'fish' ? 'bg-blue-500' :
            'bg-purple-500'
          }`}>
            {recipe.protein}
          </span>
        </div>

        {recipe.photoLink && (
          <div className="w-full h-48 rounded-xl overflow-hidden mb-4 bg-gray-100">
            <Image 
              src={recipe.photoLink} 
              alt={recipe.name}
              width={400}
              height={192}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => e.target.parentElement.style.display = 'none'}
            />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            🥬 {recipe.veggie === 'true' ? 'With Veggies' : 'No Veggies'}
          </span>
        </div>

        <div className={`text-gray-700 leading-relaxed ${expanded ? '' : 'max-h-32 overflow-hidden relative'}`}>
          <div className="mb-3">
            <strong className="text-gray-800">Ingredients:</strong>
            <div className="mt-1">
              {recipe.ingredients.split('•').filter(item => item.trim()).map((item, i) => (
                <div key={i} className="ml-2">• {item.trim()}</div>
              ))}
            </div>
          </div>
          
          <div>
            <strong className="text-gray-800">Steps:</strong>
            <div className="mt-1">
              {recipe.steps.split(/\d+\./).filter(step => step.trim()).map((step, i) => (
                <div key={i} className="ml-2 mb-1">{i + 1}. {step.trim()}</div>
              ))}
            </div>
          </div>

          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-medium hover:shadow-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      </article>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading your delicious recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Low-Cal Recipe Box - Quick & Easy Weight Loss Recipes</title>
        <meta name="description" content="Discover delicious low-calorie recipes for realistic weight loss. Quick, easy recipes with beef, pork, chicken, and fish plus healthy snack ideas." />
        <meta name="keywords" content="low calorie recipes, weight loss, healthy cooking, quick recipes, diet meals" />
        <meta property="og:title" content="Low-Cal Recipe Box" />
        <meta property="og:description" content="Quick, easy, and delicious recipes for realistic weight loss" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://lowcal-recipebox.vercel.com" />
      </Head>

      {/* Ezoic Scripts */}
      <Script 
        src="https://cmp.gatekeeperconsent.com/min.js" 
        strategy="afterInteractive"
        data-cfasync="false"
      />
      <Script 
        src="https://the.gatekeeperconsent.com/cmp.min.js" 
        strategy="afterInteractive"
        data-cfasync="false"
      />
      <Script 
        src="//www.ezojs.com/ezoic/sa.min.js" 
        strategy="afterInteractive"
      />
      <Script id="ezoic-standalone" strategy="afterInteractive">
        {`
          window.ezstandalone = window.ezstandalone || {};
          ezstandalone.cmd = ezstandalone.cmd || [];
        `}
      </Script>

      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 scroll-smooth">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <header className="text-center mb-8 bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-xl">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <Image 
                  src="/images/logo.png" 
                  alt="Low-Cal Recipe Collection Logo" 
                  width={80} 
                  height={80}
                  className="drop-shadow-lg"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">Low-Cal Recipe Collection</h1>
            </div>
            <p className="text-xl text-white/90">Quick, easy, and delicious recipes for realistic weight loss</p>
          </header>

          {/* Tips Section */}
          <section className="bg-white rounded-2xl p-6 mb-8 shadow-lg border-l-4 border-green-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 My Thoughts and Tips</h2>
            <ul className="space-y-2">
              {tips.slice(0, tipsExpanded ? tips.length : 2).map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="text-green-500 font-bold mt-1">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            {tips.length > 2 && (
              <button
                onClick={() => setTipsExpanded(!tipsExpanded)}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors hover:scale-105 transform transition-all duration-200"
              >
                {tipsExpanded ? 'Show Less Tips' : 'Show More Tips'}
              </button>
            )}
          </section>

          {/* Section Toggles */}
          <nav className="flex justify-center gap-4 mb-8 flex-wrap">
            {[
              { key: 'recipes', label: '📋 Recipes' },
              { key: 'snacks', label: '🥜 Low-Cal Snacks' },
              { key: 'prompts', label: '💬 ChatGPT Prompts' }
            ].map(section => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 transform ${
                  activeSection === section.key
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-cyan-400/30'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>

          {/* Recipes Section */}
          {activeSection === 'recipes' && (
            <section>
              {/* Filters */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-full border-none outline-none bg-white/90 placeholder-gray-500"
                  />
                  
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'beef', 'pork', 'chicken', 'fish'].map(protein => (
                      <button
                        key={protein}
                        onClick={() => setFilters(prev => ({ ...prev, protein }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 transform ${
                          filters.protein === protein
                            ? 'bg-white text-purple-600'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {protein === 'all' ? 'All' : 
                         protein === 'beef' ? '🥩 Beef' :
                         protein === 'pork' ? '🐷 Pork' :
                         protein === 'chicken' ? '🐔 Chicken' :
                         '🐟 Fish'}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'All Veggies' },
                      { key: 'true', label: 'With Veggies' },
                      { key: 'false', label: 'No Veggies' }
                    ].map(veggie => (
                      <button
                        key={veggie.key}
                        onClick={() => setFilters(prev => ({ ...prev, veggie: veggie.key }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 transform ${
                          filters.veggie === veggie.key
                            ? 'bg-white text-purple-600'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {veggie.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recipes Grid */}
              {filteredRecipes.length === 0 ? (
                <div className="text-center text-white bg-white/10 backdrop-blur-sm rounded-2xl p-12">
                  <h3 className="text-2xl font-bold mb-2">No recipes found</h3>
                  <p>Try adjusting your search terms or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe, index) => {
                    const items = [<RecipeCard key={`recipe-${index}`} recipe={recipe} index={index} />];
                    
                    // Add ads after every 3rd recipe
                    if ((index + 1) % 3 === 0) {
                      const adIndex = Math.floor(index / 3);
                      const adPlacements = [
                        { id: 115, name: 'incontent_5' },
                        { id: 111, name: 'mid_content' },
                        { id: 112, name: 'long_content' },
                        { id: 113, name: 'longer_content' }
                      ];
                      const adPlacement = adPlacements[adIndex % adPlacements.length];
                      
                      items.push(
                        <div key={`ad-${adIndex}`} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex items-center justify-center min-h-[300px] col-span-1 md:col-span-2 lg:col-span-3">
                          <div className="w-full max-w-4xl">
                            {/* Ezoic Ad Placeholder */}
                            <div 
                              id={`ezoic-pub-ad-placeholder-${adPlacement.id}`}
                              className="w-full min-h-[250px] bg-white/5 rounded-xl flex items-center justify-center"
                            >
                              <span className="text-white/60 text-sm">Advertisement</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return items;
                  }).flat()}
                </div>
              )}
            </section>
          )}

          {/* Snacks Section */}
          {activeSection === 'snacks' && (
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">🥜 Low-Calorie Tasty Snacks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {snacks.map((snack, index) => (
                  <article key={index} className="bg-gray-50 rounded-xl p-6 border-l-4 border-green-500 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{snack.name}</h3>
                    {snack.calories && (
                      <div className="text-red-600 font-bold text-sm mb-3">📊 {snack.calories} calories</div>
                    )}
                    {snack.details && (
                      <p className="text-gray-700 leading-relaxed mb-4">{snack.details}</p>
                    )}
                    {snack.photo && (
                      <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-200">
                        <Image 
                          src={snack.photo} 
                          alt={snack.name}
                          width={400}
                          height={160}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.parentElement.style.display = 'none'}
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Prompts Section */}
          {activeSection === 'prompts' && (
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">💬 My ChatGPT Recipe Prompts</h2>
              <div className="space-y-6">
                {prompts.map((prompt, index) => (
                  <article key={index} className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">🍳 Prompt {index + 1}</h3>
                    <div className="bg-white p-4 rounded-lg border font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {prompt}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
          
          {/* Footer */}
          <footer className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <Image 
                  src="/images/logo.png" 
                  alt="Low-Cal Recipe Collection Logo" 
                  width={50} 
                  height={50}
                  className="drop-shadow-lg"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                />
              </div>
              <p className="text-white/80">© 2025 Low-Cal Recipe Collection. Made with ❤️ for healthy living.</p>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}